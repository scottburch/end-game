import type {GraphOpts} from "@end-game/graph";
import {graphOpen} from "@end-game/graph";
import {newUid} from "@end-game/graph";
import {switchMap} from "rxjs";
import {levelStoreHandlers} from "@end-game/level-store";



export const getAGraph = (opts: GraphOpts = {graphId: newUid()}) => graphOpen(opts).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
);

