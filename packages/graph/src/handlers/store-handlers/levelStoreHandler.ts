import {MemoryLevel} from "memory-level";
import type {GraphHandler} from '@end-game/graph'
import {IndexTypes} from '../../graph/graph.js';
import type {Graph, GraphNode, Props} from "../../graph/graph.js";
import {
    catchError, combineLatest,
    concatMap, from, last,
    map,
    merge,
    mergeMap, Observable,
    of,
    range,
    switchMap,
    takeWhile, tap,
    throwError, toArray
} from "rxjs";
import type {Relationship} from "../../graph/relationship.js";
import {AbstractLevel} from "abstract-level";
import type {AbstractIteratorOptions} from "abstract-level";
import {Level} from "level";
import type {Iterator} from "level";
import {appendHandler} from "@end-game/rxjs-chain";
import {deserializer, serializer} from "@end-game/utils/serializer";



type LevelStore = AbstractLevel<string>;

export type LevelHandlerOpts = {
    dir?: string
}

export const levelStoreHandlers = (graph: Graph, opts: LevelHandlerOpts = {}) => of(graph).pipe(
        tap(graph => appendHandler(graph.chains.putNode, 'storage', levelStorePutNodeHandler(opts))),
        tap(graph => appendHandler(graph.chains.getNode, 'storage', levelStoreGetNodeHandler(opts))),
        tap(graph => appendHandler(graph.chains.putEdge, 'storage', levelStorePutEdgeHandler(opts))),
        tap(graph => appendHandler(graph.chains.getEdge, 'storage', levelStoreGetEdgeHandler(opts))),
        tap(graph => appendHandler(graph.chains.nodesByLabel, 'storage', levelStoreNodesByLabelHandler(opts))),
        tap(graph => appendHandler(graph.chains.nodesByProp, 'storage', levelStoreNodesByPropHandler(opts))),
        tap(graph => appendHandler(graph.chains.getRelationships, 'storage', levelStoreGetRelationshipsHandler(opts)))
);

const stores: Record<string, LevelStore> = {};

const getStore = (graph: Graph, handlerOpts: LevelHandlerOpts) => of(stores[graph.graphId]).pipe(
    map(store => store || (handlerOpts.dir ? new Level(handlerOpts.dir) : new MemoryLevel())),
    tap(store => stores[graph.graphId] = store)
);


const storeIterator = (store: LevelStore, query: AbstractIteratorOptions<string, string>) => new Observable<Iterator<any, any, any>>(observer => {
    const iterator = store.iterator(query);
    observer.next(iterator);
    return () => iterator.close()
});


export const levelStoreGetNodeHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'getNode'> =>
    ({graph, nodeId}) => getStore(graph, handlerOpts).pipe(
        mergeMap(store => store.get([graph.graphId, nodeId].join('.'))),
        map(json => ({graph, node: deserializer(json), nodeId})),
        catchError(err => err.notFound ? of({graph, nodeId}) : throwError(err))
    );

export const levelStorePutNodeHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'putNode'> =>
    ({graph, node}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => combineLatest([
            store.put([graph.graphId, node.nodeId].join('.'), serializer(node)),
            store.put([graph.graphId, IndexTypes.LABEL, node.label, node.nodeId].join('.'), ''),
            createNodePropIndexes(graph, store, node)
        ])),
        tap(x => x),
        map(() => ({graph, node}))
    );

const createNodePropIndexes = (graph: Graph, store: LevelStore, node: GraphNode<Props>) =>
    Object.keys(node.props).length ? from(Object.keys(node.props)).pipe(
        switchMap(key => store.put([graph.graphId, IndexTypes.PROP, node.label, key, node.props[key].toString(), node.nodeId].join('.'), '')),
        last()
    ) : of(undefined);

export const levelStorePutEdgeHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'putEdge'> =>
    ({graph, edge}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => merge(
            store.put([graph.graphId, edge.edgeId].join('.'), serializer(edge)),
            store.put([graph.graphId, IndexTypes.FROM_REL, edge.from, edge.rel, edge.to].join('.'), edge.edgeId),
            store.put([graph.graphId, IndexTypes.TO_REL, edge.to, edge.rel, edge.from].join('.'), edge.edgeId)
        )),
        map(() => ({graph, edge}))
    );

export const levelStoreGetEdgeHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'getEdge'> =>
    ({graph, edgeId}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => store.get([graph.graphId, edgeId].join('.'))),
        map(json => deserializer(json)),
        map(edge => ({graph, edgeId, edge}))
    );

export const levelStoreNodesByLabelHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'nodesByLabel'> =>
    ({graph, label}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, IndexTypes.LABEL, label]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[3]),
            switchMap(nodeId => levelStoreGetNodeHandler(handlerOpts)({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Props>),
            toArray()
        )),
        map(nodes => ({graph, label, nodes})),
    );

export const levelStoreNodesByPropHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'nodesByProp'> =>
    ({graph, label, key, value}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, IndexTypes.PROP, label, key, value.toString()]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[5]),
            mergeMap(nodeId => levelStoreGetNodeHandler(handlerOpts)({graph, nodeId: nodeId as string})),
            map(({node}) => node as GraphNode<Props>),
            toArray()
        )),
        map(nodes => ({graph, label, key, value, nodes}))
    )


const keySearchCriteria = (segments: string[]) =>
    segments[segments.length - 1].includes('*') ? ({
        gte: segments.join('.').replace('*', ''),
        lt: segments.join('.').replace('*', '') + String.fromCharCode(255)
    }) : ({
        gt: segments.join('.') + '.',
        lt: segments.join('.') + '.' + String.fromCharCode(255)
    });




export const levelStoreGetRelationshipsHandler = (handlerOpts: LevelHandlerOpts): GraphHandler<'getRelationships'> =>
    ({graph, nodeId, rel, reverse}) => getStore(graph, handlerOpts).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, reverse ? IndexTypes.TO_REL : IndexTypes.FROM_REL, nodeId, rel]))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => [pair?.[0].split('.')[4], pair?.[1]]),
            map(([to, edgeId]) => ({
                edgeId: edgeId || '',
                to: reverse ? nodeId : (to || ''),
                from: reverse ? (to || '') : nodeId
            }) satisfies Relationship),
            toArray()
        )),
        map(relationships => ({graph, rel, nodeId, to: '', from: '', relationships, reverse}))
    )
