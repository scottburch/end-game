import {filter, map, mergeMap, Observable, of, switchMap, tap} from "rxjs";
import {newUid} from "./uid.js";
import ld from 'lodash'

import type {Relationship} from "./relationship.js";
import type {RxjsChain} from "@end-game/rxjs-chain";
import type {RxjsChainFn} from '@end-game/rxjs-chain';
import {chainNext, newRxjsChain} from "@end-game/rxjs-chain";
import type {Seconds} from "@end-game/utils/types";


export type Props = Record<string, any>;

export const IndexTypes = {
    LABEL: '0',
    FROM_REL: '1',
    TO_REL: '2',
    PROP: '3'
} as const


export type GraphNode<T extends Props = Props> = {
    nodeId: NodeId
    label: string
    state: string
    props: T
}

export type GraphEdge<T extends Props = Props> = {
    edgeId: EdgeId
    rel: string
    from: NodeId
    to: NodeId
    state: string
    props: T
}

export type GraphHandler<T extends keyof Graph['chains']> = RxjsChainFn<Graph['chains'][T]['type']>
export type GraphHandlerProps<T extends keyof Graph['chains']> = Graph['chains'][T]['type'];

export enum LogLevel {INFO, WARNING, ERROR, DEBUG}

export type GraphLogItem<T extends Object> = {
    module: string,
    code: string,
    level: LogLevel,
    data: T
}

export type RangeOpts = {
    gt?: string
    gte?: string
    lt?: string
    lte?: string
    reverse?: boolean
    limit?: number
}

export type GraphSettings = {
    subscriptionTimeout: Seconds
}

export type Graph = {
    graphId: GraphId
    chains: {
        log: RxjsChain<{ graph: Graph, item: GraphLogItem<Object> }>
        putNode: RxjsChain<{ graph: Graph, node: GraphNode }>
        getNode: RxjsChain<{ graph: Graph, nodeId: NodeId, node: GraphNode, opts: { local?: boolean, since?: string } }>
        putEdge: RxjsChain<{ graph: Graph, edge: GraphEdge }>
        getEdge: RxjsChain<{ graph: Graph, edgeId: EdgeId, edge: GraphEdge, opts: { local?: boolean} }>
        reloadGraph: RxjsChain<{}>
        nodesByLabel: RxjsChain<{ graph: Graph, label: string, nodes?: GraphNode[], opts: RangeOpts }>
        nodesByProp: RxjsChain<{
            graph: Graph,
            label: string,
            key: string,
            value: string,
            nodes?: GraphNode[],
            opts: RangeOpts
        }>
        getRelationships: RxjsChain<{
            graph: Graph,
            nodeId: NodeId,
            rel: string,
            relationships?: Relationship[],
            reverse: boolean
        }>
    }
    logLevel: LogLevel,
    settings: GraphSettings
}


export type GraphOpts = Partial<Graph> & Pick<Graph, 'graphId'>


export type NodeId = (string & { type: 'nodeId' }) | ''
export type EdgeId = (string & { type: 'edgeId' }) | ''
export type GraphId = (string & { type: 'graphId' }) | ''

export const asNodeId = (nodeId: string) => nodeId as NodeId;
export const asEdgeId = (edgeId: string) => edgeId as EdgeId;
export const asGraphId = (graphId: string) => graphId as GraphId;

export const graphOpen = (opts: GraphOpts) => {
    const graph = {
        ...opts,
        graphId: opts.graphId || asGraphId(newUid()),
        chains: {
            log: opts.chains?.log || newRxjsChain({name: 'log'}),
            putNode: opts.chains?.putNode || newRxjsChain({logger: chainLogger('putNode'), name: 'putNode'}),
            getNode: opts.chains?.getNode || newRxjsChain({logger: chainLogger('getNode'), name: 'getNode'}),
            putEdge: opts.chains?.putEdge || newRxjsChain({logger: chainLogger('putEdge'), name: 'putEdge'}),
            getEdge: opts.chains?.getEdge || newRxjsChain({logger: chainLogger('getEdge'), name: 'getEdge'}),
            nodesByLabel: opts.chains?.nodesByLabel || newRxjsChain({
                logger: chainLogger('nodesByLabel'),
                name: 'nodesByLabel'
            }),
            nodesByProp: opts.chains?.nodesByProp || newRxjsChain({
                logger: chainLogger('nodesByProp'),
                name: 'nodesByProp'
            }),
            getRelationships: opts.chains?.getRelationships || newRxjsChain({
                logger: chainLogger('getRelationships'),
                name: 'getRelationships'
            }),
            reloadGraph: opts.chains?.reloadGraph || newRxjsChain({
                logger: chainLogger('reloadGraph'),
                name: 'reloadGraph'
            })
        },
        logLevel: opts.logLevel || LogLevel.INFO,
        settings: {
            subscriptionTimeout: 300,
            ...opts.settings
        }

    } satisfies Graph as Graph;

    return of(graph);

    function chainLogger(chainName: string) {
        return (module: string, v: any) =>
            chainNext(graph.chains.log, {
                graph, item: {
                    module,
                    code: 'CHAIN',
                    level: LogLevel.DEBUG,
                    data: {
                        graphId: graph.graphId,
                        chainName: chainName,
                        value: ld.omit(v, 'graph')
                    }
                }
            }).subscribe()
    }

}


export const newNode = <T extends Props>(nodeId: NodeId, label: string, props: T) => ({
    nodeId: nodeId || newUid() as NodeId,
    label,
    props,
    state: Date.now().toString()
} satisfies GraphNode<T>);


export const putNode = <T extends Props>(graph: Graph, node: GraphNode<T>) =>
    chainNext(graph.chains.putNode, {graph, node}).pipe(
        map(({node}) => ({graph, nodeId: node.nodeId})),
    );

export const newEdge = <T extends Props>(edgeId: EdgeId, rel: string, from: NodeId, to: NodeId, props: T) => ({
        edgeId: edgeId || asEdgeId(newUid()), rel, props, from, to, state: Date.now().toString()
    } satisfies GraphEdge<T>
)

export const putEdge = <T extends Props>(graph: Graph, edge: GraphEdge<T>) =>
    chainNext(graph.chains.putEdge, {graph, edge}).pipe(
        map(({edge}) => ({graph, edge}))
    );

export const getEdge = <T extends Props>(graph: Graph, edgeId: EdgeId, opts: GraphHandlerProps<'getEdge'>['opts']) =>
    new Observable<GraphHandlerProps<'getEdge'>>(subscriber => {
        const putEdgeSub = graph.chains.putEdge.pipe(
            filter(({edge}) => edge.edgeId === edgeId),
            tap(({edge}) => subscriber.next({graph, edgeId, edge: edge as GraphEdge<T>, opts}))
        ).subscribe();

        const getEdgeSub = graph.chains.getEdge.pipe(
            filter(({edge}) => edge === undefined || edge?.edgeId === edgeId),
            map(({edge, edgeId, graph}) => ({graph, edgeId, edge: edge as GraphEdge<T>})),
            tap(({edge}) => subscriber.next({graph, edgeId, edge, opts}))
        ).subscribe();

        const reloadSub = graph.chains.reloadGraph.pipe(
            switchMap(() => chainNext(graph.chains.getEdge, {graph, edgeId, edge: {} as GraphEdge<T>, opts: {}}))
        ).subscribe()


        chainNext(graph.chains.getEdge, {graph, edgeId, edge: {} as GraphEdge<T>, opts: {}}).subscribe();

        return () => {
            putEdgeSub.unsubscribe();
            getEdgeSub.unsubscribe();
            reloadSub.unsubscribe();
        }
    });

export type GraphHandlerPropsWithNodeType<P extends keyof Graph['chains'], T extends Props> = Omit<GraphHandlerProps<P>, 'node'> & {node: GraphNode<T>}



export const getNodeInternal = <T extends Props>(graph: Graph, nodeId: NodeId, opts: GraphHandlerProps<'getNode'>['opts']) =>
    new Observable<GraphHandlerPropsWithNodeType<'getNode', T>>(subscriber => {
        let lastProps: string;

// TODO: This is here to stop duplicate notifications for updated nodes due to the auth module getting a node again
        // performance may be a concern here
        const checkCache = (props: any) => {
            const str = JSON.stringify(props);
            const result = str !== lastProps;

            lastProps = str;
            return result;
        }

        const putSub = graph.chains.putNode.pipe(
            filter(({node: n}) => n.nodeId === nodeId),
            filter(({node}) => checkCache(node.props)),
            tap(({node}) => subscriber.next({graph, nodeId, node: node as GraphNode<T>, opts}))
        ).subscribe();

        const getSub = graph.chains.getNode.pipe(
            filter(({node}) => node === undefined || node.nodeId === nodeId),
            filter(({node}) => checkCache(node.props)),
            filter(({node}) => opts.since ? node.state > opts.since : true),
            map(({node}) => ({node: node as GraphNode<T>})),
            tap(({node}) => subscriber.next({graph, nodeId, node, opts}))
        ).subscribe();

        const reloadSub = graph.chains.reloadGraph.pipe(
            switchMap(() => chainNext(graph.chains.getNode, {graph, nodeId, node: {} as GraphNode<T>, opts}))
        ).subscribe()

        chainNext(graph.chains.getNode, {graph, nodeId, node: {} as GraphNode<T>, opts}).subscribe();

        return () => {
            putSub.unsubscribe();
            getSub.unsubscribe();
            reloadSub.unsubscribe();
            subscriber.complete();
        }
    });

export const nodesByLabel = <T extends Props>(graph: Graph, label: string, opts: RangeOpts = {}) =>
    new Observable<{ graph: Graph, label: string, nodes: GraphNode<T>[] }>(subscriber => {
        const putSub = graph.chains.putNode.pipe(
            filter(({node}) => node.label === label),
            mergeMap(() => chainNext(graph.chains.nodesByLabel, {graph, label, opts}))
        ).subscribe();

        const nodesSub = graph.chains.nodesByLabel.pipe(
            filter(({label: l}) => l === label),
            tap(({nodes}) => subscriber.next({graph, nodes: (nodes || []) as GraphNode<T>[], label}))
        ).subscribe();

        const reloadSub = graph.chains.reloadGraph.pipe(
            switchMap(() => chainNext(graph.chains.nodesByLabel, {graph, label, opts}))
        ).subscribe();

        chainNext(graph.chains.nodesByLabel, {graph, label, opts}).subscribe();

        return () => {
            putSub.unsubscribe();
            nodesSub.unsubscribe();
            reloadSub.unsubscribe();
        };
    });

export const getRelationships = (graph: Graph, nodeId: NodeId, rel: string, opts: { reverse?: boolean } = {}) =>
    new Observable<{
        graph: Graph,
        nodeId: NodeId,
        rel: string,
        opts: { reverse?: boolean },
        relationships: Relationship[]
    }>(subscriber => {
        const putEdgeSub = graph.chains.putEdge.pipe(
            filter(({edge}) => edge.from === nodeId || edge.to === nodeId),
            mergeMap(() => chainNext(graph.chains.getRelationships, {graph, nodeId, rel, reverse: !!opts.reverse}))
        ).subscribe();

        const getRelSub = graph.chains.getRelationships.pipe(
            filter(({nodeId: nid, rel: r}) => nid === nodeId && r === rel),
            tap(({relationships}) => subscriber.next({graph, nodeId, rel, opts, relationships: relationships || []}))
        ).subscribe();

        const reloadSub = graph.chains.reloadGraph.pipe(
            switchMap(() => chainNext(graph.chains.getRelationships, {graph, nodeId, rel, reverse: !!opts.reverse}))
        ).subscribe()


        chainNext(graph.chains.getRelationships, {graph, nodeId, rel, reverse: !!opts.reverse}).subscribe();

        return () => {
            putEdgeSub.unsubscribe();
            getRelSub.unsubscribe();
            reloadSub.unsubscribe();
        }
    })

export const nodesByProp = <T extends Props>(graph: Graph, label: string, key: keyof T & string, value: any, opts: RangeOpts = {}) =>
    new Observable<{ graph: Graph, nodes: GraphNode<T>[], label: string, key: string, value: string }>(subscriber => {
        const putSub = graph.chains.putNode.pipe(
            filter(({node}) => node.label === label),
            mergeMap(() => chainNext(graph.chains.nodesByProp, {graph, label, key, value, opts}))
        ).subscribe();

        const nodesByPropSub = graph.chains.nodesByProp.pipe(
            filter(({label: l, key: k, value: v}) => l === label && k === key && v === value),
            tap(({nodes}) => subscriber.next({graph, nodes: (nodes || []) as GraphNode<T>[], label, key, value}))
        ).subscribe();

        const reloadSub = graph.chains.reloadGraph.pipe(
            switchMap(() => chainNext(graph.chains.nodesByProp, {graph, label, key: key, value, opts}))
        ).subscribe()

        chainNext(graph.chains.nodesByProp, {graph, label, key, value, opts}).subscribe();

        return () => {
            putSub.unsubscribe();
            nodesByPropSub.unsubscribe();
            reloadSub.unsubscribe();
        }
    });

