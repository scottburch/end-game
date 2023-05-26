import {filter, map, mergeMap, Observable, of, tap} from "rxjs";
import {newUid} from "./uid.js";

import type {DeepPartial} from "tsdef";
import type {Relationship} from "./relationship.js";
import type {RxjsChain} from "@end-game/rxjs-chain";
import type {RxjsChainFn} from '@end-game/rxjs-chain';
import {chainNext, newRxjsChain} from "@end-game/rxjs-chain";

export type NodeId = string
export type EdgeId = string

export type Props = Record<string, any>;

export const IndexTypes = {
    LABEL: '0',
    FROM_REL: '1',
    TO_REL: '2',
    PROP: '3'
} as const


export type GraphNode<T extends Props> = {
    nodeId: string
    label: string
    props: T
}

export type GraphEdge<T extends Record<string, any>> = {
    edgeId: EdgeId
    rel: string
    from: NodeId
    to: NodeId
    props: T
}

export type GraphHandler<T extends keyof Graph['chains']> = RxjsChainFn<Graph['chains'][T]['type']>

export enum LogLevel {INFO, WARNING, ERROR, DEBUG}

export type GraphLogItem = {
    code: string,
    text: string,
    level: LogLevel
}



export type Graph = {
    graphId: string
    chains: {
        log: RxjsChain<{graph: Graph, item: GraphLogItem}>
        putNode: RxjsChain<{ graph: Graph, node: GraphNode<Props> }>
        getNode: RxjsChain<{ graph: Graph, nodeId: NodeId, node?: GraphNode<Props> }>
        putEdge: RxjsChain<{ graph: Graph, edge: GraphEdge<Props> }>
        getEdge: RxjsChain<{ graph: Graph, edgeId: EdgeId, edge?: GraphEdge<Props> }>
        nodesByLabel: RxjsChain<{ graph: Graph, label: string, nodes?: GraphNode<Props>[] }>
        nodesByProp: RxjsChain<{ graph: Graph, label: string, key: string, value: string, nodes?: GraphNode<Props>[] }>
        getRelationships: RxjsChain<{
            graph: Graph,
            nodeId: NodeId,
            rel: string,
            relationships?: Relationship[],
            reverse: boolean
        }>
    }
}


export type GraphOpts = DeepPartial<Graph> & Pick<Graph, 'graphId'>


export const graphOpen = (opts: GraphOpts = {graphId: newUid()}) => of({
    ...opts,
    graphId: opts.graphId || newUid(),
    chains: {
        log: opts.chains?.log || newRxjsChain(),
        putNode: opts.chains?.putNode || newRxjsChain(),
        getNode: opts.chains?.getNode || newRxjsChain(),
        putEdge: opts.chains?.putEdge || newRxjsChain(),
        getEdge: opts.chains?.getEdge || newRxjsChain(),
        nodesByLabel: opts.chains?.nodesByLabel || newRxjsChain(),
        nodesByProp: opts.chains?.nodesByProp || newRxjsChain(),
        getRelationships: opts.chains?.getRelationships || newRxjsChain()
    }
} as Graph);

export const newGraphNode = <T extends Props>(nodeId: string, label: string, props: T) => ({
    nodeId: nodeId || newUid(),
    label,
    props
} satisfies GraphNode<T>);


export const graphPutNode = <T extends Props>(graph: Graph, node: GraphNode<T>) =>
    chainNext(graph.chains.putNode, {graph, node}).pipe(
        map(({node}) => ({graph, nodeId: node.nodeId})),
    );

export const newGraphEdge = <T extends Props>(edgeId: string, rel: string, from: NodeId, to: NodeId, props: T) => ({
    edgeId: edgeId || newUid(), rel, props, from, to} satisfies GraphEdge<T>
)

export const graphPutEdge = <T extends Props>(graph: Graph, edge: GraphEdge<T>) =>
    chainNext(graph.chains.putEdge, {graph, edge}).pipe(
        map(({edge}) => ({graph, edge}))
    );

export const graphGetEdge = <T extends Props>(graph: Graph, edgeId: string) =>
    new Observable<{ graph: Graph, edgeId: EdgeId, edge: GraphEdge<T> }>(subscriber => {
        const putEdgeSub = graph.chains.putEdge.pipe(
            filter(({edge}) => edge.edgeId === edgeId),
            mergeMap(() => chainNext(graph.chains.getEdge, {graph, edgeId}))
        ).subscribe();

        const getEdgeSub = graph.chains.getEdge.pipe(
            filter(({edge}) => edge === undefined || edge?.edgeId === edgeId),
            map(({edge, edgeId, graph}) => ({graph, edgeId, edge: edge as GraphEdge<T>})),
            tap(({edge}) => subscriber.next({graph, edgeId, edge}))
        ).subscribe();

        chainNext(graph.chains.getEdge, {graph, edgeId}).subscribe();

        return () => {
            putEdgeSub.unsubscribe();
            getEdgeSub.unsubscribe();
        }
    });


export const graphGet = <T extends Props>(graph: Graph, nodeId: NodeId) =>
    new Observable<{ graph: Graph, nodeId: NodeId, node: GraphNode<T> }>(observable => {
        const putSub = graph.chains.putNode.pipe(
            filter(({node: n}) => n.nodeId === nodeId),
            mergeMap(({node: n}) => chainNext(graph.chains.getNode, {graph, nodeId: n.nodeId, node: n}))
        ).subscribe();

        const getSub = graph.chains.getNode.pipe(
            filter(({node}) => node === undefined || node.nodeId === nodeId),
            map(({node}) => ({node: node as GraphNode<T>})),
            tap(({node}) => observable.next({graph, nodeId, node}))
        ).subscribe();

        chainNext(graph.chains.getNode, {graph, nodeId}).subscribe();

        return () => {
            putSub.unsubscribe();
            getSub.unsubscribe();
        }
    });

export const nodesByLabel = <T extends Props>(graph: Graph, label: string) =>
    new Observable<{ graph: Graph, label: string, nodes: GraphNode<T>[] }>(subscriber => {
        const putSub = graph.chains.putNode.pipe(
            filter(({node}) => node.label === label),
            mergeMap(() => chainNext(graph.chains.nodesByLabel, {graph, label}))
        ).subscribe();

        const nodesSub = graph.chains.nodesByLabel.pipe(
            filter(({label: l}) => l === label),
            tap(({nodes}) => subscriber.next({graph, nodes: (nodes || []) as GraphNode<T>[], label}))
        ).subscribe();

        chainNext(graph.chains.nodesByLabel, {graph, label}).subscribe();

        return () => {
            putSub.unsubscribe();
            nodesSub.unsubscribe();
        }
    });

export const graphGetRelationships = (graph: Graph, nodeId: NodeId, rel: string, opts: { reverse?: boolean } = {}) =>
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

        chainNext(graph.chains.getRelationships, {graph, nodeId, rel, reverse: !!opts.reverse}).subscribe();

        return () => {
            putEdgeSub.unsubscribe();
            getRelSub.unsubscribe();
        }
    })

export const nodesByProp = <T extends Props>(graph: Graph, label: string, key: string, value: any) =>
    new Observable<{ graph: Graph, nodes: GraphNode<T>[], label: string, key: string, value: string }>(subscriber => {
        const putSub = graph.chains.putNode.pipe(
            filter(({node}) => node.label === label),
            mergeMap(() => chainNext(graph.chains.nodesByProp, {graph, label, key, value}))
        ).subscribe();

        const nodesByPropSub = graph.chains.nodesByProp.pipe(
            filter(({label: l, key: k, value: v}) => l === label && k === key && v === value),
            tap(({nodes}) => subscriber.next({graph, nodes: (nodes || []) as GraphNode<T>[], label, key, value}))
        ).subscribe();

        chainNext(graph.chains.nodesByProp, {graph, label, key, value}).subscribe();

        return () => {
            putSub.unsubscribe();
            nodesByPropSub.unsubscribe();
        }
    });

