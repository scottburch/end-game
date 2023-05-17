import {filter, first, map, of, raceWith, switchMap, tap, timer} from "rxjs";
import type {Graph, GraphEdge, GraphNode, NodeId, Props} from '@end-game/graph'
import {graphGet, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {sign, verify} from '@end-game/crypto'
import {serializer} from "@end-game/utils/serializer";


export type UserPass = {
    username: string
    password: string
}

export type GraphWithUser = Graph & { user?: { auth: KeyBundle, nodeId: NodeId } };
export type NodeWithSig<T extends Props> = GraphNode<T> & { sig: Uint8Array }




export const authNodeExists = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => !!nodes.length)
    );

export const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => node as GraphNode<EncryptedKeyBundle>)
    );






export const isUserAuthedToWriteEdge = (graph: Graph, edge: GraphEdge<Props>) =>
    getNodeOnce(graph, edge.from).pipe(
    switchMap(({node}) => node ? isUserNodeOwner(graph, node as NodeWithSig<Props>) : of(true)),
);

export const isUserLoggedIn = (graph: GraphWithUser) =>
    !!graph.user?.auth.pubKey

export const signGraphNode = (graph: GraphWithUser, node: GraphNode<any>) =>
    getNodeSignData(node).pipe(
        switchMap(bytes => sign(bytes, graph.user?.auth as KeyBundle)),
        map(sig => ({...node, sig})),
        map(node => ({graph, node}))
    );

export const isUserNodeOwner = (graph: GraphWithUser, node: NodeWithSig<any>) =>
    timer(1000).pipe(switchMap(() => of(true))).pipe(
        raceWith(
            graphGet(graph, node.nodeId).pipe(
                filter(({node}) => !!node),
                switchMap(({node}) => getNodeSignData(node).pipe(
                    switchMap(bytes => verify(bytes, (node as NodeWithSig<Props>).sig, graph.user?.auth.pubKey as CryptoKey))
                )),
                first()
            )
        )
    );


export const getNodeSignData = (node: GraphNode<any>) =>
    of(node.nodeId + node.label + serializer(node.props)).pipe(
        map(str => new TextEncoder().encode(str))
    );



const getNodeOnce = (graph: Graph, nodeId: NodeId) =>
    timer(1000).pipe(map(() => ({graph, nodeId, node: undefined}))).pipe(
        raceWith(graphGet(graph, nodeId).pipe(
            tap(x => x),
            filter(({node}) => !!node),
            first()
        ))
    );

