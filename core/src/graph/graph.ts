import {filter, first, map, Observable, of, switchMap} from "rxjs";
import {newUid} from "../utils/uid.js";
import {nullHandler} from "../handlers/handlers.js";
import {DeepPartial} from "tsdef";
import {Relationship} from "./relationship.js";


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

type GraphEdge<T extends Record<string, any>> = {
    edgeId: EdgeId
    rel: string
    from: NodeId
    to: NodeId
    props: T
}

export type Graph = {
    graphId: string
    handlers: {
        putNode: Handler<{graph: Graph, node: GraphNode<Props>}>
        getNode: Handler<{graph: Graph, nodeId: NodeId, node?: GraphNode<Props>}>
        putEdge: Handler<{graph: Graph, edge: GraphEdge<Props>}>
        getEdge: Handler<{graph: Graph, edgeId: EdgeId, edge?: GraphEdge<Props>}>
        nodesByLabel: Handler<{graph: Graph, label: string, nodes?: GraphNode<Props>[]}>
        nodesByProp: Handler<{graph: Graph, label: string, key: string, value: string, nodes?: GraphNode<Props>[]}>
        getRelationships: Handler<{graph: Graph, nodeId: NodeId, rel: string, relationships?: Relationship[], reverse: boolean}>
    }
}

export type HandlerNames = keyof Graph['handlers']
export type Handler<T> = Observable<T> & {next: (v: T) => Observable<T>, props: T};
export type HandlerProps<T extends HandlerNames> = Graph['handlers'][T]['props'];
export type HandlerFn<T extends HandlerNames> = (p: HandlerProps<T>) => Observable<HandlerProps<T>>;

export type GraphOpts = DeepPartial<Graph> & Pick<Graph, 'graphId'>


export const graphOpen = (opts: GraphOpts) => of({
    ...opts,
    handlers: {
        putNode: opts.handlers?.putNode || nullHandler<'putNode'>(),
        getNode: opts.handlers?.getNode || nullHandler<'getNode'>(),
        putEdge: opts.handlers?.putEdge || nullHandler<'putEdge'>(),
        getEdge: opts.handlers?.getEdge || nullHandler<'getEdge'>(),
        nodesByLabel: opts.handlers?.nodesByLabel || nullHandler<'nodesByLabel'>(),
        nodesByProp: opts.handlers?.nodesByProp || nullHandler<'nodesByProp'>(),
        getRelationships: opts.handlers?.getRelationships || nullHandler<'getRelationships'>()
    }
} as Graph);

export const graphPut = <T extends Props>(graph: Graph, nodeId: string, label: string, props: T) =>
    of({
        nodeId: nodeId || newUid(),
        label,
        props
    } satisfies GraphNode<T>).pipe(
        switchMap(node => graph.handlers.putNode.next({graph, node}).pipe(
            filter(({node: {nodeId}}) => node.nodeId === nodeId)
        )),
        map(({node}) => ({graph, nodeId: node.nodeId})),
        first()
    );

export const graphPutEdge = <T extends Props>(graph: Graph, label: string, from: NodeId, to: NodeId, props: T) =>
    of({edgeId: newUid(), rel: label, props, from, to } satisfies GraphEdge<T>).pipe(
        switchMap(edge => graph.handlers.putEdge.next({graph, edge})),
        first()
    );

export const graphGetEdge = <T extends Props>(graph: Graph, edgeId: string) =>
    graph.handlers.getEdge.next({graph, edgeId}).pipe(
        filter(({edge}) => edge === undefined || edge?.edgeId === edgeId),
        map(({edge, edgeId, graph}) => ({graph, edgeId, edge: edge as GraphEdge<T>}))
    );



export const graphGet = <T extends Props>(graph: Graph, nodeId: NodeId) =>
    graph.handlers.getNode.next({graph, nodeId}).pipe(
        filter(({node, nodeId}) =>  node === undefined || node.nodeId === nodeId),
        map(({node}) => ({graph, node: node as GraphNode<T>}))
    );

export const nodesByLabel = <T extends Props>(graph: Graph, label: string) =>
    graph.handlers.nodesByLabel.next({graph, label}).pipe(
        filter(({label: l}) => l === label),
        map(({nodes}) => ({graph, label, nodes: nodes as GraphNode<T>[]})),
        first()
    );

export const nodesByProp = <T extends Props>(graph: Graph, label: string, key: string, value: any ) =>
    graph.handlers.nodesByProp.next({graph, label, key, value}).pipe(
        filter(({label: l, key: k, value: v}) => label === l && key === k && value === v ),
        map(({nodes}) => ({graph, label, key, value, nodes}))
    );

export const graphGetRelationships = (graph: Graph, nodeId: NodeId, rel: string, opts: {reverse?: boolean} = {}) =>
    graph.handlers.getRelationships.next({graph, nodeId, rel, reverse: !!opts.reverse}).pipe(
        filter(({nodeId: nid, rel: r}) => nid === nodeId && r === rel),
        map(({relationships}) => ({graph, nodeId, rel, opts, relationships}))
    );


