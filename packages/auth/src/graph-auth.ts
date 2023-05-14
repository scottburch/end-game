import {catchError, delay, filter, first, iif, map, merge, of, raceWith, switchMap, tap, throwError, timer} from "rxjs";
import type {Graph, GraphHandler, GraphNode, NodeId, Props} from '@end-game/graph'
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
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'auth', authPutPostHandler))
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    return node.label === 'auth' ? (
        of({graph, node}).pipe(
            switchMap(({graph, node}) => authNodeExists(graph, node.props.username)),
            switchMap(exists => exists ? throwError(() => 'USER_ALREADY_EXISTS') : of({graph, node})),
        )
    ) : (
        of((graph as GraphWithUser).user).pipe(
            switchMap(user => user?.auth.pubKey ? (
                of({graph, node})
            ) : (
                throwError(() => 'NOT_LOGGED_IN')
            )),
        )
    ).pipe(
        switchMap(({graph, node}) =>
            verifyUserAuth(graph, node as NodeWithSig<Props>).pipe(
                switchMap(valid => valid ? (
                    of({graph, node})
                ) : (
                    throwError(() => 'UNAUTHORIZED_USER')
                ))
            )
        ),
        switchMap(({graph, node}) => signGraphNode(graph, node))
    );
};

const signGraphNode = (graph: GraphWithUser, node: GraphNode<any>) =>
    getNodeSignData(node).pipe(
        switchMap(bytes => sign(bytes, graph.user?.auth as KeyBundle)),
        map(sig => ({...node, sig})),
        map(node => ({graph, node}))
    );

const verifyUserAuth = (graph: GraphWithUser, node: NodeWithSig<any>) =>
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
    )


const authPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    return of((graph as GraphWithUser).user?.nodeId).pipe(
        switchMap(nodeId => nodeId ? (
            graphPutEdge(graph, '', 'owned_by', node.nodeId, nodeId, {})
        ) : of(undefined)),
        map(() => ({graph, node}))
    )
}

