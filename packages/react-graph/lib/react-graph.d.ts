import type { Graph, GraphNode, NodeId, Props } from '@end-game/graph';
import type { PropsWithChildren } from 'react';
import * as React from 'react';
export declare const useGraph: () => Graph;
export declare const useGraphNodesByLabel: <T extends Props>(label: string) => GraphNode<T>[] | undefined;
export declare const useGraphGet: <T extends Props>(nodeId: NodeId) => GraphNode<T> | undefined;
export declare const useGraphPut: <T extends Props>() => (label: string, nodeId: NodeId, props: T) => import("rxjs").Observable<{
    graph: Graph;
    nodeId: string;
}>;
export declare const ReactGraph: React.FC<PropsWithChildren<{
    graph?: Graph;
}>>;
//# sourceMappingURL=react-graph.d.ts.map