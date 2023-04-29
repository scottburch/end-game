import { Observable } from "rxjs";
import type { DeepPartial } from "tsdef";
import type { Relationship } from "./relationship.js";
export type NodeId = string;
export type EdgeId = string;
export type Props = Record<string, any>;
export declare const IndexTypes: {
    readonly LABEL: "0";
    readonly FROM_REL: "1";
    readonly TO_REL: "2";
    readonly PROP: "3";
};
export type GraphNode<T extends Props> = {
    nodeId: string;
    label: string;
    props: T;
};
type GraphEdge<T extends Record<string, any>> = {
    edgeId: EdgeId;
    rel: string;
    from: NodeId;
    to: NodeId;
    props: T;
};
export type Graph = {
    graphId: string;
    handlers: {
        putNode: Handler<{
            graph: Graph;
            node: GraphNode<Props>;
        }>;
        getNode: Handler<{
            graph: Graph;
            nodeId: NodeId;
            node?: GraphNode<Props>;
        }>;
        putEdge: Handler<{
            graph: Graph;
            edge: GraphEdge<Props>;
        }>;
        getEdge: Handler<{
            graph: Graph;
            edgeId: EdgeId;
            edge?: GraphEdge<Props>;
        }>;
        nodesByLabel: Handler<{
            graph: Graph;
            label: string;
            nodes?: GraphNode<Props>[];
        }>;
        nodesByProp: Handler<{
            graph: Graph;
            label: string;
            key: string;
            value: string;
            nodes?: GraphNode<Props>[];
        }>;
        getRelationships: Handler<{
            graph: Graph;
            nodeId: NodeId;
            rel: string;
            relationships?: Relationship[];
            reverse: boolean;
        }>;
    };
};
export type HandlerNames = keyof Graph['handlers'];
export type Handler<T> = Observable<T> & {
    next: (v: T) => Observable<T>;
    props: T;
};
export type HandlerProps<T extends HandlerNames> = Graph['handlers'][T]['props'];
export type HandlerFn<T extends HandlerNames> = (p: HandlerProps<T>) => Observable<HandlerProps<T>>;
export type GraphOpts = DeepPartial<Graph> & Pick<Graph, 'graphId'>;
export declare const graphOpen: (opts: GraphOpts) => Observable<Graph>;
export declare const graphPut: <T extends Props>(graph: Graph, nodeId: string, label: string, props: T) => Observable<{
    graph: Graph;
    nodeId: string;
}>;
export declare const graphPutEdge: <T extends Props>(graph: Graph, label: string, from: NodeId, to: NodeId, props: T) => Observable<{
    graph: Graph;
    edge: GraphEdge<Props>;
}>;
export declare const graphGetEdge: <T extends Props>(graph: Graph, edgeId: string) => Observable<{
    graph: Graph;
    edgeId: string;
    edge: GraphEdge<T>;
}>;
export declare const graphGet: <T extends Props>(graph: Graph, nodeId: NodeId) => Observable<{
    graph: Graph;
    nodeId: NodeId;
    node: GraphNode<T>;
}>;
export declare const nodesByLabel: <T extends Props>(graph: Graph, label: string) => Observable<{
    graph: Graph;
    label: string;
    nodes: GraphNode<T>[];
}>;
export declare const nodesByProp: <T extends Props>(graph: Graph, label: string, key: string, value: any) => Observable<{
    graph: Graph;
    label: string;
    key: string;
    value: any;
    nodes: GraphNode<Props>[] | undefined;
}>;
export declare const graphGetRelationships: (graph: Graph, nodeId: NodeId, rel: string, opts?: {
    reverse?: boolean;
}) => Observable<{
    graph: Graph;
    nodeId: string;
    rel: string;
    opts: {
        reverse?: boolean | undefined;
    };
    relationships: Relationship[] | undefined;
}>;
export {};
//# sourceMappingURL=graph.d.ts.map