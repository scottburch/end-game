import {graphOpen, levelStoreHandlers} from "@end-game/graph";
import {switchMap} from "rxjs";
import {authHandlers} from "../auth-handlers.js";

export const graphWithAuth = () => graphOpen().pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph))
);

export const graphWithNoAuth = () => graphOpen().pipe(
    switchMap(graph => levelStoreHandlers(graph))
);
