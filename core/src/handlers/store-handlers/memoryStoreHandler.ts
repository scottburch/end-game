import {MemoryLevel} from "memory-level";
import {Graph, GraphNode, HandlerFn, IndexTypes, Props} from "../../graph/graph.js";
import {
    catchError,
    concatMap, from,
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
            store.put([graph.graphId, IndexTypes.LABEL, node.label, node.nodeId].join('.'), ''),
            createNodePropIndexes(graph, store, node)
        )),
        map(() => ({graph, node}))
    );

const createNodePropIndexes = (graph: Graph, store: MemoryLevel, node: GraphNode<Props>) =>
    from(Object.keys(node.props)).pipe(
        switchMap(key => store.put([graph.graphId, IndexTypes.PROP, node.label, key, JSON.stringify(node.props[key]), node.nodeId].join('.'), ''))
    );

export const memoryStorePutEdgeHandler: HandlerFn<'putEdge'> =
    ({graph, edge}) => of(getStore(graph)).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, edge.edgeId].join('.'), JSON.stringify(edge)),
            store.put([graph.graphId, IndexTypes.FROM_REL, edge.from, edge.rel, edge.to].join('.'), edge.edgeId), // edge from rel indexes
            store.put([graph.graphId, IndexTypes.TO_REL, edge.to, edge.rel, edge.from].join('.'), edge.edgeId)   // edge to rel index
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
            map(pair => pair?.[0].split('.')[3]),
            mergeMap(nodeId => memoryStoreGetNodeHandler({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Props>),
            toArray(),
            tap(() => iterator.close())
        )),
        map(nodes => ({graph, label, nodes})),
    );

export const memoryStoreNodesByPropHandler: HandlerFn<'nodesByProp'> =
    ({graph, label, key, value}) => of(getStore(graph)).pipe(
        map(store => store.iterator(keySearchCriteria([graph.graphId, IndexTypes.PROP, label, key, JSON.stringify(value)]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[5]),
            mergeMap(nodeId => memoryStoreGetNodeHandler({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Props>),
            toArray(),
            tap(() => iterator.close())
        )),
        map(nodes => ({graph, label, key, value, nodes}))
    )


const keySearchCriteria = (segments: string[]) => ({
    gt: segments.join('.') + '.',
    lt: segments.join('.') + '.' + String.fromCharCode(255)
});

export const memoryStoreGetRelationships: HandlerFn<'getRelationships'> =
    ({graph, nodeId, rel, reverse}) => of(getStore(graph)).pipe(
        map(store => store.iterator(keySearchCriteria([graph.graphId, reverse ? IndexTypes.TO_REL : IndexTypes.FROM_REL, nodeId, rel]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => [pair?.[0].split('.')[4], pair?.[1]]),
            map(([to, edgeId]) => ({edgeId: edgeId || '', to: reverse ? nodeId : (to || ''), from: reverse ? (to || '') : nodeId}) satisfies Relationship),
            toArray(),
            tap(() => iterator.close())
        )),
        map(relationships => ({graph, rel, nodeId, to: '', from: '', relationships, reverse}))
    )
