import {graphOpen, levelStoreHandlers, newUid} from "@end-game/graph";
import {switchMap} from "rxjs";
import {authHandlers} from "../graph-auth.js";

export const graphWithAuth = () => graphOpen().pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph))
);
