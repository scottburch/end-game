import {catchError, combineLatest, filter, first, map, of, switchMap, tap, throwError, timeout} from "rxjs";
import type {Graph, GraphEdge, GraphNode, NodeId, Props} from '@end-game/graph'
import {graphError, graphGetNode, LogLevel, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {deserializePubKey, sign, verify} from '@end-game/crypto'
import {serializer} from "@end-game/utils/serializer";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {chainNext} from "@end-game/rxjs-chain";
import {unauthorizedUserError} from "./auth-errors.js";
import {textToBytes} from "@end-game/utils/byteUtils";


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
export type NodeWithAuth<T extends Props = Props> = GraphNode<T> & { sig: Uint8Array, owner: NodeId }
export type EdgeWithSig<T extends Props = Props> = GraphEdge<T> & {sig: Uint8Array }

export type AuthNode = GraphNode<EncryptedKeyBundle & { username: string }>;

const TIMEOUT = 1000

export const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => ({graph, node: node as AuthNode})),
        timeout({first: TIMEOUT, with: () => of({graph, node: {} as AuthNode})}),
        first()
    );

export const isUserAuthedToWriteEdge = (graph: Graph, edge: GraphEdge) =>
    getNodeOnce(graph, edge.from).pipe(
        switchMap(({node}) => node ? isUserNodeOwner(graph as GraphWithAuth, node as NodeWithAuth<Props>) : of(true)),
    );

export const isUserLoggedIn = (graph: GraphWithAuth) =>
    !!graph.user?.auth.pubKey

export const signGraphNode = (graph: GraphWithAuth, node: GraphNode<any>) =>
    getNodeSignData(node).pipe(
        switchMap(bytes => sign(bytes, graph.user?.auth as KeyBundle)),
        map(sig => ({...node, sig})),
        map(node => ({graph, node}))
    );

export const signGraphEdge = (graph: GraphWithAuth, edge: GraphEdge<any>) =>
    getEdgeSignData(edge).pipe(
        switchMap(bytes => sign(bytes, graph.user?.auth as KeyBundle)),
        map(sig => ({...edge, sig})),
        map(edge => ({graph, edge}))
    )

export const isUserNodeOwner = (graph: GraphWithAuth, node: NodeWithAuth<any>) => {
    // PERF: This is here to speed up the local addition of nodes, assuming that a node with no sig is local.
    // TODO: Need to make sure that someone can not send a node with no sig in order to force you to sign it.
    return node.sig ? checkNodeOwner(TIMEOUT) : checkNodeOwner(100)

    function checkNodeOwner(maxWait: number) {
        return graphGetNode(graph, node.nodeId, {}).pipe(
            filter(({node}) => !!node),
            switchMap(({node}) => getNodeSignData(node).pipe(
                switchMap(bytes => verify(bytes, (node as NodeWithAuth<Props>).sig, graph.user?.auth.pubKey as CryptoKey))
            )),
            first(),
            timeout({first: maxWait, with: () => of(true)})
        );
    }
}



export const getNodeSignData = (node: GraphNode<any>) =>
    of(node.nodeId + node.label + serializer(node.props)).pipe(
        map(str => textToBytes(str))
    );

export const getEdgeSignData = (edge: GraphEdge<any>) =>
    of(edge.edgeId + edge.rel + edge.from + edge.to + serializer(edge.props)).pipe(
        map(str => textToBytes(str))
    )


const getNodeOnce = (graph: Graph, nodeId: NodeId) =>
    graphGetNode(graph, nodeId, {}).pipe(
        tap(x => x),
        filter(({node}) => !!node?.nodeId),
        first(),
        timeout({first: TIMEOUT, with: () => of({graph, nodeId, node: undefined})})
    );

export const graphGetOwnerNode = (graph: Graph, nodeId: NodeId) =>
    graphGetNode(graph, nodeId, {}).pipe(
        filter(({node}) => !!node?.nodeId),
        first(),
        switchMap(({node}) => graphGetNode(graph, (node as NodeWithAuth).owner, {}).pipe(
            filter(({node}) => !!node?.nodeId)
        )),
        timeout({first: TIMEOUT * 1.2, with: () => of({graph, nodeId: '', node: {} as AuthNode})}),
    );

export const verifyEdgeSig = <T extends Props>(graph: Graph, edge: EdgeWithSig<T>) =>
    graphGetOwnerNode(graph, edge.from).pipe(
        switchMap(({node: authNode}) =>
            authNode.nodeId ? (
                combineLatest([
                    getEdgeSignData(edge),
                    deserializePubKey(authNode.props.pub)
                ]).pipe(
                    switchMap(([data, pubKey]) => verify(data, (edge as EdgeWithSig<Props>).sig, pubKey)),
                    map(() => ({edge, authNode})),
                    catchError(err => err.message === 'Invalid keyData' ? unauthorizedUserError(graph, authNode.props.username) : of(err))
                )
            ) : of(undefined).pipe(
                tap(() => chainNext(graph.chains.log, {
                    graph,
                    item: {
                        code: 'EDGE_SIG_VERIFY_ERROR',
                        level: LogLevel.INFO,
                        text: 'Unable to verify edge signature, no auth object: ' + edge.edgeId + ':' + edge.from + '-' + edge.to
                    }

                }))
            )
        ),
        map(() => ({graph, edge}))
    );



export const verifyNodeSig = <T extends Props>(graph: Graph, node: NodeWithAuth<T>) =>
    graphGetOwnerNode(graph, node.nodeId).pipe(
        switchMap(({node: authNode}) =>
            authNode.nodeId ? (
                combineLatest([
                    getNodeSignData(node),
                    deserializePubKey(authNode.props.pub)
                ]).pipe(
                    switchMap(([data, pubKey]) => verify(data, (node as NodeWithAuth<Props>).sig, pubKey)),
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

export const asGraphWithAuth = (graph: Graph) =>
    of(graph as GraphWithAuth).pipe(
        switchMap(graph => !!graph.user ? of(graph) : throwError(() => graphError(graph, 'INVALID_AUTH_CONVERSION_NO_USER', {text: 'Conversion to GraphWithUser with no user property'})))
    )









