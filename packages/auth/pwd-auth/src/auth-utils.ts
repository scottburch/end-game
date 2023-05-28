import {catchError, combineLatest, filter, first, map, of, switchMap, tap, timeout} from "rxjs";
import type {Graph, GraphEdge, GraphNode, NodeId, Props} from '@end-game/graph'
import {graphGetNode, graphGetRelationships, LogLevel, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {deserializePubKey, sign, verify} from '@end-game/crypto'
import {serializer} from "@end-game/utils/serializer";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {chainNext} from "@end-game/rxjs-chain";
import {unauthorizedUserError} from "./auth-errors.js";


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
export type AuthNode = GraphNode<EncryptedKeyBundle & { username: string }>;

const TIMEOUT = 2000

export const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => ({graph, node: node as AuthNode})),
        timeout({first: TIMEOUT, with: () => of({graph, node: {} as AuthNode})}),
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
    graphGetNode(graph, node.nodeId).pipe(
        filter(({node}) => !!node),
        switchMap(({node}) => getNodeSignData(node).pipe(
            switchMap(bytes => verify(bytes, (node as NodeWithSig<Props>).sig, graph.user?.auth.pubKey as CryptoKey))
        )),
        first(),
        timeout({first: TIMEOUT, with: () => of(true)})
    );


export const getNodeSignData = (node: GraphNode<any>) =>
    of(node.nodeId + node.label + serializer(node.props)).pipe(
        map(str => new TextEncoder().encode(str))
    );


const getNodeOnce = (graph: Graph, nodeId: NodeId) =>
    graphGetNode(graph, nodeId).pipe(
        tap(x => x),
        filter(({node}) => !!node),
        first(),
        timeout({first: TIMEOUT, with: () => of({graph, nodeId, node: undefined})})
    );

export const graphGetOwnerNode = (graph: Graph, nodeId: NodeId) =>
    graphGetRelationships(graph, nodeId, 'owned_by').pipe(
        filter(({relationships}) => !!relationships.length),
        map(({relationships}) => relationships[0].to),
        switchMap(authNodeId => graphGetNode(graph, authNodeId).pipe(
            filter(({node}) => !!node?.nodeId)
        )),
        timeout({first: TIMEOUT * 1.2, with: () => of({graph, nodeId: '', node: {} as AuthNode})}),
    );

export const verifyNodeSig = <T extends Props>(graph: Graph, node: NodeWithSig<T>) =>
    graphGetOwnerNode(graph, node.nodeId).pipe(
        switchMap(({node: authNode}) =>
            authNode.nodeId ? (
                combineLatest([
                    getNodeSignData(node),
                    deserializePubKey(authNode.props.pub)
                ]).pipe(
                    switchMap(([data, pubKey]) => verify(data, (node as NodeWithSig<Props>).sig, pubKey)),
                    map(() => ({node, authNode})),
                    catchError(err => err.message === 'Invalid keyData' ? unauthorizedUserError(graph, authNode.props.username) : of(err))
                )
            ) : of(undefined).pipe(
                tap(() => chainNext(graph.chains.log, {
                    graph,
                    item: {
                        code: 'NODE_SIG_VERIFY_ERROR',
                        level: LogLevel.INFO,
                        text: 'Unable to verify node signature, no auth object: ' + node.nodeId
                    }

                }))
            )
        ),
        map(() => ({graph, node}))
    );









