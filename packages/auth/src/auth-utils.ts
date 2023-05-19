import {filter, first, map, of, switchMap, tap, timeout} from "rxjs";
import type {Graph, GraphEdge, GraphNode, NodeId, Props} from '@end-game/graph'
import {graphGet, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {sign, verify} from '@end-game/crypto'
import {serializer} from "@end-game/utils/serializer";
import type {RxjsChain} from "@end-game/rxjs-chain";


export type UserPass = {
    username: string
    password: string
}

export type GraphWithAuth = Graph & {
    user?: {
        auth: KeyBundle,
        nodeId: NodeId,
        username: string
    },
    chains: Graph['chains'] & {
        authChanged: RxjsChain<{ graph: Graph }>
    }
};
export type NodeWithSig<T extends Props> = GraphNode<T> & { sig: Uint8Array }


export const doesAuthNodeExist = (graph: Graph, username: string) => {
    return nodesByProp(graph, 'auth', 'username', username).pipe(
        filter(({nodes}) => !!nodes.length),
        map(() => ({graph, exists: true})),
        timeout({first: 1000, with: () => of({graph, exists: false})})
    );
}
export const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => ({graph, node: node as GraphNode<EncryptedKeyBundle>})),
        timeout({first: 1000, with: () => of({graph, node: {} as GraphNode<EncryptedKeyBundle> })}),
        first()
    );

export const isUserAuthedToWriteEdge = (graph: Graph, edge: GraphEdge<Props>) =>
    getNodeOnce(graph, edge.from).pipe(
        switchMap(({node}) => node ? isUserNodeOwner(graph as GraphWithAuth, node as NodeWithSig<Props>) : of(true)),
    );

export const isUserLoggedIn = (graph: GraphWithAuth) =>
    !!graph.user?.auth.pubKey

export const signGraphNode = (graph: GraphWithAuth, node: GraphNode<any>) =>
    getNodeSignData(node).pipe(
        switchMap(bytes => sign(bytes, graph.user?.auth as KeyBundle)),
        map(sig => ({...node, sig})),
        map(node => ({graph, node}))
    );

export const isUserNodeOwner = (graph: GraphWithAuth, node: NodeWithSig<any>) =>
    graphGet(graph, node.nodeId).pipe(
        filter(({node}) => !!node),
        switchMap(({node}) => getNodeSignData(node).pipe(
            switchMap(bytes => verify(bytes, (node as NodeWithSig<Props>).sig, graph.user?.auth.pubKey as CryptoKey))
        )),
        first(),
        timeout({first: 1000, with: () => of(true)})
    );


export const getNodeSignData = (node: GraphNode<any>) =>
    of(node.nodeId + node.label + serializer(node.props)).pipe(
        map(str => new TextEncoder().encode(str))
    );


const getNodeOnce = (graph: Graph, nodeId: NodeId) =>
    graphGet(graph, nodeId).pipe(
        tap(x => x),
        filter(({node}) => !!node),
        first(),
        timeout({first: 1000, with: () => of({graph, nodeId, node: undefined})})
    );

