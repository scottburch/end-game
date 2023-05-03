import type {GraphOpts} from "../graph/graph.js";
import {graphOpen} from "../graph/graph.js";
import {newUid} from "../utils/uid.js";
import {switchMap} from "rxjs";
import {levelStoreHandlers} from "../handlers/store-handlers/levelStoreHandler.js";



export const getAGraph = (opts: GraphOpts = {graphId: newUid()}) => graphOpen(opts).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
);

