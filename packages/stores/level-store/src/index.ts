import {MemoryLevel} from "memory-level";
import type {GraphEdge, GraphHandler} from '@end-game/graph'
import {IndexTypes} from '@end-game/graph';
import type {Graph, GraphNode} from "@end-game/graph";
import {
    catchError, combineLatest,
    concatMap, filter, from, last,
    map,
    mergeMap, Observable,
    of,
    range,
    switchMap,
    takeWhile, tap,
    throwError, toArray
} from "rxjs";
import type {Relationship} from "@end-game/graph";
import {AbstractLevel} from "abstract-level";
import type {AbstractIteratorOptions} from "abstract-level";
import {Level} from "level";
import type {Iterator} from "level";
import {appendHandler} from "@end-game/rxjs-chain";
import {deserializer, serializer} from "@end-game/utils/serializer";
import type {RangeOpts} from "@end-game/graph";


type LevelStore = AbstractLevel<string>;

export type LevelHandlerOpts = {
    dir?: string
}

export type GraphWithLevel = Graph & {
    levelStore: LevelStore
}


export const levelStoreHandlers = (graph: Graph, opts: LevelHandlerOpts = {}) => of(graph).pipe(
    tap(graph => appendHandler(graph.chains.putNode, 'storage', levelStorePutNodeHandler())),
    tap(graph => appendHandler(graph.chains.getNode, 'storage', levelStoreGetNodeHandler())),
    tap(graph => appendHandler(graph.chains.putEdge, 'storage', levelStorePutEdgeHandler())),
    tap(graph => appendHandler(graph.chains.getEdge, 'storage', levelStoreGetEdgeHandler())),
    tap(graph => appendHandler(graph.chains.nodesByLabel, 'storage', levelStoreNodesByLabelHandler())),
    tap(graph => appendHandler(graph.chains.nodesByProp, 'storage', levelStoreNodesByPropHandler())),
    tap(graph => appendHandler(graph.chains.getRelationships, 'storage', levelStoreGetRelationshipsHandler())),
    tap(graph => (graph as GraphWithLevel).levelStore = opts.dir ? new Level(opts.dir) as LevelStore : new MemoryLevel() as LevelStore)
);

const getStore = (graph: Graph) => of((graph as GraphWithLevel).levelStore);

const storeIterator = (store: LevelStore, query: AbstractIteratorOptions<string, string>) => new Observable<Iterator<any, any, any>>(observer => {
    const iterator = store.iterator(query);
    observer.next(iterator);
    return () => iterator.close()
});


export const levelStoreGetNodeHandler = (): GraphHandler<'getNode'> =>
    ({graph, nodeId, opts}) => getStore(graph).pipe(
        mergeMap(store => store.get([graph.graphId, nodeId].join('.'))),
        map(json => ({graph, node: deserializer<GraphNode>(json), nodeId, opts})),
        catchError(err => err.notFound ? of({graph, nodeId, node: {} as GraphNode, opts}) : throwError(err))
    );

export const levelStorePutNodeHandler = (): GraphHandler<'putNode'> => {
    return ({graph, node}) => getStore(graph).pipe(
        switchMap(store => of(undefined).pipe(
            switchMap(() => checkState(graph, store, node)),
            switchMap(() => combineLatest([
                store.put([graph.graphId, node.nodeId].join('.'), serializer(node)),
                store.put([graph.graphId, IndexTypes.LABEL, node.label, node.nodeId].join('.'), ''),
                createNodePropIndexes(graph, store, node)
            ])),
            map(() => ({graph, node}))
        ))
    );

    function checkState(graph: Graph, store: LevelStore, node: GraphNode) {
        return from(store.get([graph.graphId, node.nodeId].join('.'))).pipe(
            map(data => deserializer<GraphNode>(data)),
            filter(n => n.state < node.state),
            catchError(err => err.notFound ? of({graph, node: {} as GraphNode}) : throwError(err))
        )
    }
}

const createNodePropIndexes = (graph: Graph, store: LevelStore, node: GraphNode) => {
    return Object.keys(node.props).length ? from(Object.keys(node.props)).pipe(
        switchMap(key => Array.isArray(node.props[key]) ? arrayPropIdx(node.label, key, node.props[key]) : standardPropIdx(node.label, key, node.props[key])),
        last()
    ) : of(undefined);

    function arrayPropIdx(label: string, key: string, propArr: any[]) {
        return propArr.length ? from(propArr).pipe(
            mergeMap(prop => standardPropIdx(label, key, prop)),
            last()
        ) : of(undefined);
    }

    function standardPropIdx(label: string, key: string, prop: any) {
        return of([graph.graphId, IndexTypes.PROP, label, key, prop, node.nodeId].join('.')).pipe(
            switchMap(key => store.put(key, ''))
        )
    }
}

export const levelStorePutEdgeHandler = (): GraphHandler<'putEdge'> => {
    return ({graph, edge}) => getStore(graph).pipe(
        switchMap(store => of(undefined).pipe(
            switchMap(() => checkState(graph, store, edge)),
            switchMap(() => combineLatest([
                store.put([graph.graphId, edge.edgeId].join('.'), serializer(edge)),
                store.put([graph.graphId, IndexTypes.FROM_REL, edge.from, edge.rel, edge.to].join('.'), edge.edgeId),
                store.put([graph.graphId, IndexTypes.TO_REL, edge.to, edge.rel, edge.from].join('.'), edge.edgeId)
            ])),
            map(() => ({graph, edge}))
        ))
    );

    function checkState(graph: Graph, store: LevelStore, edge: GraphEdge) {
        return from(store.get([graph.graphId, edge.edgeId].join('.'))).pipe(
            map(data => deserializer<GraphEdge>(data)),
            filter(e => e.state < edge.state),
            catchError(err => err.notFound ? of({graph, edge: {} as GraphEdge}) : throwError(err))
        )
    }
}

export const levelStoreGetEdgeHandler = (): GraphHandler<'getEdge'> =>
    ({graph, edgeId, opts}) => getStore(graph).pipe(
        switchMap(store => store.get([graph.graphId, edgeId].join('.'))),
        map(json => deserializer<GraphEdge>(json)),
        map(edge => ({graph, edgeId, edge, opts})),
        catchError(err => err.notFound ? of({graph, edgeId, edge: {} as GraphEdge, opts}) : throwError(err))
    );

export const levelStoreNodesByLabelHandler = (): GraphHandler<'nodesByLabel'> =>
    ({graph, label, opts}) => getStore(graph).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, IndexTypes.LABEL, label], opts))),
        switchMap(iterator => range(1, 100).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[3]),
            mergeMap(nodeId => levelStoreGetNodeHandler()({
                graph,
                nodeId,
                node: {} as GraphNode,
                opts: {}
            })),
            map(({node}) => node as GraphNode),
            toArray()
        )),
        map(nodes => ({graph, label, nodes, opts})),
    );

export const levelStoreNodesByPropHandler = (): GraphHandler<'nodesByProp'> =>
    ({graph, label, key, value, opts}) => getStore(graph).pipe(
        switchMap(store => storeIterator(store, keySearchCriteria([graph.graphId, IndexTypes.PROP, label, key, value.toString()], opts))),
        switchMap(iterator => range(1, 1000).pipe(
            concatMap(() => iterator.next()),
            takeWhile(pair => !!pair?.[0]),
            map(pair => pair?.[0].split('.')[5]),
            mergeMap(nodeId => levelStoreGetNodeHandler()({
                graph,
                nodeId,
                node: {} as GraphNode,
                opts: {}
            })),
            map(({node}) => node as GraphNode),
            toArray()
        )),
        map(nodes => ({graph, label, key, value, nodes, opts}))
    )


const keySearchCriteria = (segments: string[], opts: RangeOpts = {}) => {
    if(opts.gt && segments.indexOf('') !== -1) {
        opts.gt = opts.gt.slice(0, -1) + String.fromCharCode(opts.gt.slice(-1).charCodeAt(0) + 1)
    }
    return segments[segments.length - 1].includes('*') ? ({
        gte: segments.join('.').replace('*', ''),
        lt: segments.join('.').replace('*', '') + String.fromCharCode(255),
        limit: opts.limit
    }) : ({
        [opts.gte ? 'gte' : 'gt']: segments.filter(seg => seg).join('.') + '.' + (opts.gt || opts.gte || ''),
        [opts.lte ? 'lte' : 'lt']: segments.filter(seg => seg).join('.') + '.' + (opts.lt || opts.lte || String.fromCharCode(255)),
        limit: opts.limit,
        reverse: opts.reverse
    });
}


export const levelStoreGetRelationshipsHandler = (): GraphHandler<'getRelationships'> =>
    ({graph, nodeId, rel, reverse}) => getStore(graph).pipe(
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
