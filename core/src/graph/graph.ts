import {first, map, Observable, of, switchMap, tap} from "rxjs";
import {newUid} from "../utils/uid.js";
import {nullHandler} from "../handlers/handlers.js";
import {DeepPartial} from "tsdef";


type GraphNode<T extends Object> = {
    nodeId: string
    label: string
    props: T

}

export type Graph = {
    graphId: string
    handlers: {
        putNode: Handler<{graph: Graph, node: GraphNode<Object>}>
        getNode: Handler<{graph: Graph, query: GraphQuery, node?: GraphNode<Object>}>
    }
}

export type HandlerNames = keyof Graph['handlers']
export type Handler<T> = Observable<T> & {next: (v: T) => Observable<T>, props: T};
export type HandlerProps<T extends HandlerNames> = Graph['handlers'][T]['props'];
export type HandlerFn<T extends HandlerNames> = (p: HandlerProps<T>) => Observable<HandlerProps<T>>;


type GraphQuery = {
    nodeId: string
}

type GraphOpts = DeepPartial<Graph>


export const graphOpen = (opts: GraphOpts) => of({
    ...opts,
    handlers: {
        putNode: opts.handlers?.putNode || nullHandler<'putNode'>(),
        getNode: opts.handlers?.getNode || nullHandler<'getNode'>()
    }
} as Graph);

export const graphPut = <T extends Object>(graph: Graph, label: string, props: T) =>
    of({
        nodeId: newUid(),
        label,
        props
    } satisfies GraphNode<T>).pipe(
        switchMap(node => graph.handlers.putNode.next({graph, node})),
        map(({node}) => ({graph, nodeId: node.nodeId})),
        first()
    )


export const graphGet = <T extends Object>(graph: Graph, label: string, query: GraphQuery) =>
    graph.handlers.getNode.next({graph, query}).pipe(
        map(({node}) => ({graph, node: node as GraphNode<T>}))
    );
