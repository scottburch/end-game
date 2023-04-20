import {MemoryLevel} from "memory-level";
import {Graph, HandlerFn} from "../../graph/graph.js";
import {catchError, map, merge, mergeMap, of, switchMap, throwError} from "rxjs";

const stores: Record<string, MemoryLevel> = {};

const getStore = (graph: Graph) => stores[graph.graphId] = stores[graph.graphId] || new MemoryLevel();

export const memoryStoreGetNodeHandler: HandlerFn<'getNode'> =
    ({graph, nodeId}) => of(getStore(graph)).pipe(
        mergeMap(store => store.get([graph.graphId, nodeId].join('.'))),
        map(json => ({graph, node: JSON.parse(json), nodeId})),
        catchError(err => err.notFound ? of({graph, nodeId}) : throwError(err))
    );

export const memoryStorePutNodeHandler: HandlerFn<'putNode'> =
    ({graph, node}) => of(getStore(graph)).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, node.nodeId].join('.'), JSON.stringify(node)),
            store.put([graph.graphId, node.label, node.nodeId].join('.'), '')
        )),
        map(() => ({graph, node}))
    );

export const memoryStorePutEdgeHandler: HandlerFn<'putEdge'> =
    ({graph, edge}) => of(getStore(graph)).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, edge.edgeId].join('.'), JSON.stringify(edge)),
        )),
        map(() => ({graph, edge}))
    );

export const memoryStoreGetEdgeHandler: HandlerFn<'getEdge'> =
    ({graph, edgeId}) => of(getStore(graph)).pipe(
        switchMap(store => store.get([graph.graphId, edgeId].join('.'))),
        map(json => JSON.parse(json)),
        map(edge => ({graph, edgeId, edge}))
    )
