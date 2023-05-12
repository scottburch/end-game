import {filter, first, map, raceWith, switchMap, tap, timer} from "rxjs";
import type {Graph} from '@end-game/graph'
import {graphPut, nodesByProp} from "@end-game/graph";
import {generateNewAccount, serializeKeys} from '@end-game/crypto'

export type UserPass = {
    username: string
    password: string
}



export const graphAuth = ({graph, username, password}: { graph: Graph } & UserPass) => timer(1000).pipe(
    raceWith(findAuthNode(graph, username)),
    first(),
    map(node => !!node ? ({nodeId: node.nodeId, auth: node.props}) : ({nodeId: '', auth: {}}))
)

const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node)
    );

export const graphNewAuth = ({graph, username, password}: {graph: Graph} & UserPass) =>
    generateNewAccount().pipe(
        switchMap(keys => serializeKeys(keys, password)),
        switchMap(keys => graphPut(graph, '', 'auth', {...keys, username})),
    )
