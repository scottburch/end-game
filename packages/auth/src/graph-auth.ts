import {catchError, filter, first, iif, map, of, raceWith, switchMap, tap, throwError, timer} from "rxjs";
import type {Graph, GraphHandler, GraphNode, NodeId} from '@end-game/graph'
import {graphPut, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {deserializeKeys, generateNewAccount, serializeKeys} from '@end-game/crypto'
import {insertHandlerBefore} from "@end-game/rxjs-chain";


export type UserPass = {
    username: string
    password: string
}

export type GraphWithUser = Graph & { user?: { auth: KeyBundle, nodeId: NodeId } };


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
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutHandler)),
);

const authPutHandler: GraphHandler<'putNode'> = ({graph, node}) =>
    node.label === 'auth' ? (
        of({graph, node}).pipe(
            switchMap(({graph, node}) => authNodeExists(graph, node.props.username)),
            switchMap(exists => exists ? throwError(() => 'USER_ALREADY_EXISTS') : of({graph, node})),
        )
    ) : (
        of((graph as GraphWithUser).user).pipe(
            switchMap(user => user?.auth.pubKey ? of({graph, node}) : throwError(() => 'NOT_LOGGED_IN'))
        )
    );
