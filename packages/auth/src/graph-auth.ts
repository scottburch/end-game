import {catchError, filter, first, iif, map, of, raceWith, switchMap, tap, throwError, timer} from "rxjs";
import type {Graph, GraphEdge, GraphHandler, GraphNode, NodeId, Props} from '@end-game/graph'
import {graphGet, graphPut, graphPutEdge, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {deserializeKeys, generateNewAccount, serializeKeys, sign, verify} from '@end-game/crypto'
import {insertHandlerAfter, insertHandlerBefore} from "@end-game/rxjs-chain";
import {serializer} from "@end-game/utils/serializer";


export type UserPass = {
    username: string
    password: string
}

export type GraphWithUser = Graph & { user?: { auth: KeyBundle, nodeId: NodeId } };
export type NodeWithSig<T extends Props> = GraphNode<T> & { sig: Uint8Array }


export const graphUnauth = (graph: Graph) => of(graph).pipe(
    tap((graph as GraphWithUser).user = undefined),
    map(() => ({graph}))
);

export const graphAuth = (graph: Graph, username: string, password: string) => timer(1000).pipe(
    raceWith(findAuthNode(graph, username)),
    first(),
    map(node => !!node ? ({nodeId: node.nodeId, auth: node.props}) : ({nodeId: '', auth: {}})),
    switchMap(({nodeId, auth}) => iif(
        () => !!(auth as EncryptedKeyBundle).pub,
        deserializeKeys(auth as EncryptedKeyBundle, password).pipe(
            map(auth => ({nodeId, auth}))
        ),
        of(undefined)
    )),
    tap(u => (graph as GraphWithUser).user = u),
    map(() => ({graph: graph as GraphWithUser})),
    catchError(err => err.cause.message.includes('bad decrypt') ? of({graph: graph as GraphWithUser}) : throwError(() => err))
);

const authNodeExists = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => !!nodes.length)
    );

const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => node as GraphNode<EncryptedKeyBundle>)
    );

export const graphNewAuth = (graph: Graph, username: string, password: string) =>
    generateNewAccount().pipe(
        switchMap(keys => serializeKeys(keys, password)),
        switchMap(keys => graphPut(graph, '', 'auth', {...keys, username})),
    );


export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutAnteHandler)),
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'auth', authPutPostHandler)),
    tap(graph => insertHandlerBefore(graph.chains.putEdge, 'storage', 'auth', authPutEdgeAnteHandler))
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if(node.label === 'auth') {
        return authNodeExists(graph, node.props.username).pipe(
            switchMap(exists => exists ? throwError(() => 'USER_ALREADY_EXISTS') : of({graph, node})),
        )
    }

    return (isUserLoggedIn(graph) ? of({graph, node}) : throwError(() => 'NOT_LOGGED_IN')).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(graph, node as NodeWithSig<Props>)),
        switchMap(isOwner => isOwner ? signGraphNode(graph, node) : throwError(() => 'UNAUTHORIZED_USER')),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) =>
    (isUserLoggedIn(graph) ? of({graph, edge}) : throwError(() => 'NOT_LOGGED_IN')).pipe(
        switchMap(() => isUserAuthedToWriteEdge(graph, edge)),
        switchMap(authed => authed ? of({graph, edge}) : throwError(() => 'UNAUTHORIZED_USER'))
    );


const isUserAuthedToWriteEdge = (graph: Graph, edge: GraphEdge<Props>) =>
    getNodeOnce(graph, edge.from).pipe(
    switchMap(({node}) => node ? isUserNodeOwner(graph, node as NodeWithSig<Props>) : of(true)),
);

const isUserLoggedIn = (graph: GraphWithUser) =>
    !!graph.user?.auth.pubKey

const signGraphNode = (graph: GraphWithUser, node: GraphNode<any>) =>
    getNodeSignData(node).pipe(
        switchMap(bytes => sign(bytes, graph.user?.auth as KeyBundle)),
        map(sig => ({...node, sig})),
        map(node => ({graph, node}))
    );

const isUserNodeOwner = (graph: GraphWithUser, node: NodeWithSig<any>) =>
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


const getNodeSignData = (node: GraphNode<any>) =>
    of(node.nodeId + node.label + serializer(node.props)).pipe(
        map(str => new TextEncoder().encode(str))
    );


const authPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if(node.label === 'auth') {
        return of({graph, node})
    }
    return of((graph as GraphWithUser).user?.nodeId).pipe(
        switchMap(nodeId => nodeId ? (
            graphPutEdge(graph, '', 'owned_by', node.nodeId, nodeId, {})
        ) : of(undefined)),
        map(() => ({graph, node}))
    )
};

const getNodeOnce = (graph: Graph, nodeId: NodeId) =>
    timer(1000).pipe(map(() => ({graph, nodeId, node: undefined}))).pipe(
        raceWith(graphGet(graph, nodeId).pipe(
            tap(x => x),
            filter(({node}) => !!node),
            first()
        ))
    );

