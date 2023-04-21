import {filter, first, map, Observable, of, switchMap} from "rxjs";
import {newUid} from "../utils/uid.js";
import {nullHandler} from "../handlers/handlers.js";
import {DeepPartial} from "tsdef";

type NodeId = string
type EdgeId = string

export type GraphNode<T extends Object> = {
    nodeId: string
    label: string
    props: T
}

type GraphEdge<T extends Object> = {
    edgeId: EdgeId
    label: string
    from: NodeId
    to: NodeId
    props: T
}

export type Graph = {
    graphId: string
    handlers: {
        putNode: Handler<{graph: Graph, node: GraphNode<Object>}>
        getNode: Handler<{graph: Graph, nodeId: NodeId, node?: GraphNode<Object>}>
        putEdge: Handler<{graph: Graph, edge: GraphEdge<Object>}>
        getEdge: Handler<{graph: Graph, edgeId: EdgeId, edge?: GraphEdge<Object>}>
        nodesByLabel: Handler<{graph: Graph, label: string, nodes?: GraphNode<Object>[]}>
        getRelatedNodes: Handler<{graph: Graph, nodeId: NodeId, label: string, relationships?: {node: GraphNode<Object>, edgeId: string}[]}>
    }
}

export type HandlerNames = keyof Graph['handlers']
export type Handler<T> = Observable<T> & {next: (v: T) => Observable<T>, props: T};
export type HandlerProps<T extends HandlerNames> = Graph['handlers'][T]['props'];
export type HandlerFn<T extends HandlerNames> = (p: HandlerProps<T>) => Observable<HandlerProps<T>>;

export type GraphOpts = DeepPartial<Graph>


export const graphOpen = (opts: GraphOpts) => of({
    ...opts,
    handlers: {
        putNode: opts.handlers?.putNode || nullHandler<'putNode'>(),
        getNode: opts.handlers?.getNode || nullHandler<'getNode'>(),
        putEdge: opts.handlers?.putEdge || nullHandler<'putEdge'>(),
        getEdge: opts.handlers?.getEdge || nullHandler<'getEdge'>(),
        nodesByLabel: opts.handlers?.nodesByLabel || nullHandler<'nodesByLabel'>(),
        getRelatedNodes: opts.handlers?.getRelatedNodes || nullHandler<'getRelatedNodes'>()
    }
} as Graph);

export const graphPut = <T extends Object>(graph: Graph, label: string, props: T) =>
    of({
        nodeId: newUid(),
        label,
        props
    } satisfies GraphNode<T>).pipe(
        switchMap(node => graph.handlers.putNode.next({graph, node}).pipe(
            filter(({node: {nodeId}}) => node.nodeId === nodeId)
        )),
        map(({node}) => ({graph, nodeId: node.nodeId})),
        first()
    );

export const graphPutEdge = <T extends Object>(graph: Graph, label: string, from: NodeId, to: NodeId, props: T) =>
    of({edgeId: newUid(), label, props, from, to } satisfies GraphEdge<T>).pipe(
        switchMap(edge => graph.handlers.putEdge.next({graph, edge})),
        first()
    );

export const graphGetEdge = <T extends Object>(graph: Graph, edgeId: string) =>
    graph.handlers.getEdge.next({graph, edgeId}).pipe(
        filter(({edge}) => edge === undefined || edge?.edgeId === edgeId),
        map(({edge, edgeId, graph}) => ({graph, edgeId, edge: edge as GraphEdge<T>}))
    );



export const graphGet = <T extends Object>(graph: Graph, nodeId: NodeId) =>
    graph.handlers.getNode.next({graph, nodeId}).pipe(
        filter(({node, nodeId}) =>  node === undefined || node.nodeId === nodeId),
        map(({node}) => ({graph, node: node as GraphNode<T>}))
    );

export const nodesByLabel = <T extends Object>(graph: Graph, label: string) =>
    graph.handlers.nodesByLabel.next({graph, label}).pipe(
        filter(({label: l}) => l === label),
        map(({nodes}) => ({graph, nodes: nodes as GraphNode<T>[]})),
        first()
    );

export const graphGetRelatedNodes = <T extends Object>(graph: Graph, nodeId: NodeId, label: string) =>
    graph.handlers.getRelatedNodes.next({graph, nodeId, label}).pipe(
        filter(({nodeId: nid, label: l}) => nid === nodeId && label === label),
        map(({relationships}) => ({graph, relationships: relationships as {node: GraphNode<T>, edgeId: string}[]}))
    );
