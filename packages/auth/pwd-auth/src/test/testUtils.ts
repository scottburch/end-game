import {
    graphOpen,
} from "@end-game/graph";
import {map, switchMap} from "rxjs";
import {authHandlers} from "../auth-handlers.js";
import {graphAuth, graphNewAuth} from "../user-auth.js";
import {levelStoreHandlers} from "@end-game/level-store";

export const graphWithAuth = () => graphOpen({graphId: 'my-graph'}).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph))
);

export const graphWithUser = (username: string = 'scott', passwd: string = 'pass') =>
    graphWithAuth().pipe(
        switchMap(graph => graphNewAuth(graph, username, passwd)),
        switchMap(({graph}) => graphAuth(graph, username, passwd)),
        map(({graph}) => graph)
    );

