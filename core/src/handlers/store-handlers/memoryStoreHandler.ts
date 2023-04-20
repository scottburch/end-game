import {MemoryLevel} from "memory-level";
import {Graph, HandlerFn} from "../../graph/graph.js";
import {catchError, map, mergeMap, of, throwError} from "rxjs";

const stores: Record<string, MemoryLevel> = {};

const getStore = (graph: Graph) => stores[graph.graphId] = stores[graph.graphId] || new MemoryLevel();

export const memoryStoreGetNodeHandler: HandlerFn<'getNode'> =
    ({graph, query}) => of(getStore(graph)).pipe(
        mergeMap(store => store.get([graph.graphId, query.nodeId].join('.'))),
        map(json => ({graph, node: JSON.parse(json), query})),
        catchError(err => err.notFound ? of({graph, query}) : throwError(err))
    );

export const memoryStorePutNodeHandler: HandlerFn<'putNode'> =
    ({graph, node}) => of(getStore(graph)).pipe(
        mergeMap(store => store.put([graph.graphId, node.nodeId].join('.'), JSON.stringify(node))),
        map(() => ({graph, node}))
    );
