import {MemoryLevel} from "memory-level";
import {Graph, GraphNode, HandlerFn, IndexTypes} from "../../graph/graph.js";
import {
    catchError,
    concatMap,
    map,
    merge,
    mergeMap,
    of,
    range,
    switchMap,
    takeWhile, tap,
    throwError, toArray
} from "rxjs";
import {Relationship} from "../../graph/relationship.js";

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
            store.put([graph.graphId, IndexTypes.LABEL, node.label, node.nodeId].join('.'), ''),   // label index
            // from(Object.keys(node.props)).pipe(
            //     switchMap(key => store.put([graph.graphId, node.label, key, JSON.stringify(node.props[key])].join('.'), ''))
            // )
        )),
        map(() => ({graph, node}))
    );

export const memoryStorePutEdgeHandler: HandlerFn<'putEdge'> =
    ({graph, edge}) => of(getStore(graph)).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, edge.edgeId].join('.'), JSON.stringify(edge)),
            store.put([graph.graphId, edge.from, edge.rel, edge.to].join('.'), edge.edgeId), // edge from rel indexes
            store.put([graph.graphId, edge.to, edge.rel, edge.from].join('.'), edge.edgeId)   // edge to rel index
        )),
        map(() => ({graph, edge}))
    );

export const memoryStoreGetEdgeHandler: HandlerFn<'getEdge'> =
    ({graph, edgeId}) => of(getStore(graph)).pipe(
        switchMap(store => store.get([graph.graphId, edgeId].join('.'))),
        map(json => JSON.parse(json)),
        map(edge => ({graph, edgeId, edge}))
    );

export const memoryStoreNodesByLabelHandler: HandlerFn<'nodesByLabel'> =
    ({graph, label}) => of(getStore(graph)).pipe(
        map(store => store.iterator(keySearchCriteria([graph.graphId, IndexTypes.LABEL, label]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].replace([graph.graphId, IndexTypes.LABEL, label].join('.') + '.', '')),
            mergeMap(nodeId => memoryStoreGetNodeHandler({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Object>),
            toArray(),
            tap(() => iterator.close())
        )),
        map(nodes => ({graph, label, nodes})),
    );

const keySearchCriteria = (segments: string[]) => ({
    gt: segments.join('.') + '.',
    lt: segments.join('.') + '.' + String.fromCharCode(255)
});

export const memoryStoreGetRelationships: HandlerFn<'getRelationships'> =
    ({graph, nodeId, rel, reverse}) => of(getStore(graph)).pipe(
        map(store => store.iterator(keySearchCriteria([graph.graphId, nodeId, rel]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => [pair?.[0].split('.')[3], pair?.[1]]),
            map(([to, edgeId]) => ({edgeId: edgeId || '', to: reverse ? nodeId : (to || ''), from: reverse ? (to || '') : nodeId}) satisfies Relationship),
            toArray(),
            tap(() => iterator.close())
        )),
        map(relationships => ({graph, rel, nodeId, to: '', from: '', relationships, reverse}))
    )
