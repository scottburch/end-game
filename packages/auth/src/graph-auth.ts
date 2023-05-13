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

let user: { nodeId: NodeId, auth: KeyBundle } = {nodeId: '', auth: {} as KeyBundle};

export const graphUnauth = () => user = {nodeId: '', auth: {} as KeyBundle};

export const graphAuth = ({graph, username, password}: { graph: Graph } & UserPass) => timer(1000).pipe(
    raceWith(findAuthNode(graph, username)),
    first(),
    map(node => !!node ? ({nodeId: node.nodeId, auth: node.props}) : ({nodeId: '', auth: {}})),
    switchMap(({nodeId, auth}) => iif(
        () => !!(auth as EncryptedKeyBundle).pub,
        deserializeKeys(auth as EncryptedKeyBundle, password).pipe(
            map(auth => ({nodeId, auth}))
        ),
        of(({nodeId: '', auth: {} as KeyBundle}))
    )),
    tap(u => user = u),
    catchError(err => err.cause.message.includes('bad decrypt') ? of({
        nodeId: '',
        auth: {} as KeyBundle
    }) : throwError(() => err))
);

const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => node as GraphNode<EncryptedKeyBundle>)
    );

export const graphNewAuth = ({graph, username, password}: { graph: Graph } & UserPass) =>
    generateNewAccount().pipe(
        switchMap(keys => serializeKeys(keys, password)),
        switchMap(keys => graphPut(graph, '', 'auth', {...keys, username})),
    );


export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutHandler)),

);

const authPutHandler: GraphHandler<'putNode'> = ({graph, node}) =>
    of(user).pipe(
        switchMap(user => user.auth.pubKey ? of({graph, node}) : throwError(() => 'NOT_LOGGED_IN'))
    )
