import {filter, first, map, raceWith, tap, timer} from "rxjs";
import type {Graph} from '@end-game/graph'
import {nodesByProp} from "@end-game/graph";

export type UserPass = {
    username: string
    password: string
}

export const graphAuth = ({graph, username, password}: { graph: Graph } & UserPass) => timer(1000).pipe(
    raceWith(findAuthNode(graph, username)),
    first(),
    tap(x => x)
)

const findAuthNode = (graph: Graph, username: string) =>
    nodesByProp(graph, 'auth', 'username', username).pipe(
        map(({nodes}) => nodes[0]),
        filter(node => !!node)
    );
