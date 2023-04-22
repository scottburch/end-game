import {MemoryLevel} from "memory-level";
import {Graph, GraphNode, HandlerFn, IndexTypes, Props} from "../../graph/graph.js";
import {
    catchError,
    concatMap, from,
    map,
    merge,
    mergeMap, Observable,
    of,
    range,
    switchMap,
    takeWhile, tap,
    throwError, toArray
} from "rxjs";
import {Relationship} from "../../graph/relationship.js";
import {AbstractIteratorOptions, AbstractLevel} from "abstract-level";
import {Iterator, Level} from "level";

type LevelStore = AbstractLevel<string>;

type HandlerOpts = {
    dir?: string
}

const stores: Record<string, LevelStore> = {};

const getStore = (graph: Graph, handlerOpts: HandlerOpts) => of(stores[graph.graphId]).pipe(
    map(store => store || (handlerOpts.dir ? new Level(handlerOpts.dir) : new MemoryLevel())),
    tap(store => stores[graph.graphId] = store)
);


const storeIterator = (store: LevelStore, query: AbstractIteratorOptions<string, string>) => new Observable<Iterator<any, any, any>>(observer => {
    const iterator = store.iterator(query);
    observer.next(iterator);
    return () => iterator.close()
});



export const memoryStoreGetNodeHandler = (handlerOpts: HandlerOpts): HandlerFn<'getNode'> =>
    ({graph, nodeId}) => getStore(graph, handlerOpts).pipe(
        mergeMap(store => store.get([graph.graphId, nodeId].join('.'))),
        map(json => ({graph, node: JSON.parse(json), nodeId})),
        catchError(err => err.notFound ? of({graph, nodeId}) : throwError(err))
    );

export const memoryStorePutNodeHandler = (handlerOpts: HandlerOpts): HandlerFn<'putNode'> =>
    ({graph, node}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, node.nodeId].join('.'), JSON.stringify(node)),
            store.put([graph.graphId, IndexTypes.LABEL, node.label, node.nodeId].join('.'), ''),
            createNodePropIndexes(graph, store, node)
        )),
        map(() => ({graph, node}))
    );

const createNodePropIndexes = (graph: Graph, store: LevelStore, node: GraphNode<Props>) =>
    from(Object.keys(node.props)).pipe(
        switchMap(key => store.put([graph.graphId, IndexTypes.PROP, node.label, key, JSON.stringify(node.props[key]), node.nodeId].join('.'), ''))
    );

export const memoryStorePutEdgeHandler = (handlerOpts: HandlerOpts): HandlerFn<'putEdge'> =>
    ({graph, edge}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, edge.edgeId].join('.'), JSON.stringify(edge)),
            store.put([graph.graphId, IndexTypes.FROM_REL, edge.from, edge.rel, edge.to].join('.'), edge.edgeId), // edge from rel indexes
            store.put([graph.graphId, IndexTypes.TO_REL, edge.to, edge.rel, edge.from].join('.'), edge.edgeId)   // edge to rel index
        )),
        map(() => ({graph, edge}))
    );

export const memoryStoreGetEdgeHandler = (handlerOpts: HandlerOpts): HandlerFn<'getEdge'> =>
    ({graph, edgeId}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => store.get([graph.graphId, edgeId].join('.'))),
        map(json => JSON.parse(json)),
        map(edge => ({graph, edgeId, edge}))
    );

export const memoryStoreNodesByLabelHandler = (handlerOpts: HandlerOpts): HandlerFn<'nodesByLabel'> =>
    ({graph, label}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, IndexTypes.LABEL, label]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[3]),
            switchMap(nodeId => memoryStoreGetNodeHandler(handlerOpts)({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Props>),
            toArray()
        )),
        map(nodes => ({graph, label, nodes})),
    );

export const memoryStoreNodesByPropHandler = (handlerOpts: HandlerOpts): HandlerFn<'nodesByProp'> =>
    ({graph, label, key, value}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, IndexTypes.PROP, label, key, JSON.stringify(value)]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[5]),
            mergeMap(nodeId => memoryStoreGetNodeHandler(handlerOpts)({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Props>),
            toArray()
        )),
        map(nodes => ({graph, label, key, value, nodes}))
    )


const keySearchCriteria = (segments: string[]) => ({
    gt: segments.join('.') + '.',
    lt: segments.join('.') + '.' + String.fromCharCode(255)
});

export const memoryStoreGetRelationshipsHandler = (handlerOpts: HandlerOpts): HandlerFn<'getRelationships'> =>
    ({graph, nodeId, rel, reverse}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, reverse ? IndexTypes.TO_REL : IndexTypes.FROM_REL, nodeId, rel]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => [pair?.[0].split('.')[4], pair?.[1]]),
            map(([to, edgeId]) => ({edgeId: edgeId || '', to: reverse ? nodeId : (to || ''), from: reverse ? (to || '') : nodeId}) satisfies Relationship),
            toArray()
        )),
        map(relationships => ({graph, rel, nodeId, to: '', from: '', relationships, reverse}))
    )
