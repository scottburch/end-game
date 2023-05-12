import {catchError, filter, first, iif, map, of, raceWith, switchMap, throwError, timer} from "rxjs";
import type {Graph, GraphNode} from '@end-game/graph'
import {graphPut, nodesByProp} from "@end-game/graph";
import type {EncryptedKeyBundle, KeyBundle} from '@end-game/crypto'
import {deserializeKeys, generateNewAccount, serializeKeys} from '@end-game/crypto'

export type UserPass = {
    username: string
    password: string
}



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
    catchError(err => err.cause.message.includes('bad decrypt') ? of({nodeId: '', auth: {} as KeyBundle}) : throwError(() => err))
);

const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node),
        map(node => node as GraphNode<EncryptedKeyBundle>)
    );

export const graphNewAuth = ({graph, username, password}: {graph: Graph} & UserPass) =>
    generateNewAccount().pipe(
        switchMap(keys => serializeKeys(keys, password)),
        switchMap(keys => graphPut(graph, '', 'auth', {...keys, username})),
    )
