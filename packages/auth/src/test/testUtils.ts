import {graphOpen, levelStoreHandlers} from "@end-game/graph";
import {map, switchMap} from "rxjs";
import {authHandlers} from "../auth-handlers.js";
import {graphAuth, graphNewAuth} from "../user-auth.js";

export const graphWithAuth = () => graphOpen().pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph))
);

export const graphWithUser = (username: string = 'scott', passwd: string = 'pass') =>
    graphWithAuth().pipe(
        switchMap(graph => graphNewAuth(graph, username, passwd)),
        switchMap(({graph}) => graphAuth(graph, username, passwd)),
        map(({graph}) => graph)
    )