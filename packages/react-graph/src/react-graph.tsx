import type {Graph, GraphNode, NodeId, EdgeId, Props, Relationship} from '@end-game/graph'
import {
    graphGet, graphGetRelationships,
    graphOpen,
    graphPut, graphPutEdge, levelStoreGetEdgeHandler, levelStoreGetRelationshipsHandler,
    levelStoreNodesByPropHandler,
    levelStorePutEdgeHandler,
    nodesByLabel, nodesByProp
} from "@end-game/graph";
import type {PropsWithChildren} from 'react';
import {createContext, useContext, useEffect, useState} from "react";
import * as React from 'react'
import {of, switchMap, tap} from "rxjs";
import {handlers} from "@end-game/graph";
import {
    levelStoreGetNodeHandler, levelStoreNodesByLabelHandler,
    levelStorePutNodeHandler
} from "@end-game/graph";
import {newUid} from "@end-game/graph";





const GraphContext: React.Context<Graph> = createContext({} as Graph);

export const useGraph = () => useContext(GraphContext);

export const useGraphNodesByLabel = <T extends Props>(label: string) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graph = useContext(GraphContext);

    useEffect(() => {
        if(graph) {
            const sub = of(true).pipe(
                switchMap(() => nodesByLabel(graph, label)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graph]);
    return nodes;
}

export const useGraphNodesByProp = <T extends Props>(label: string, key: string, value: any) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graph = useContext(GraphContext);

    useEffect(() => {
        if(graph) {
            const sub = of(true).pipe(
                switchMap(() => nodesByProp(graph, label, key, value)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graph]);
    return nodes;
}

export const useGraphRelationships = (nodeId: NodeId, rel: string, opts: {reverse?: boolean}) => {
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const graph = useContext(GraphContext);

    useEffect(() => {
        if(graph) {
            const sub = of(true).pipe(
                switchMap(() => graphGetRelationships(graph, nodeId, rel, opts)),
                tap(({relationships}) => setRelationships(relationships))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graph]);
    return relationships;

}

export const useGraphGet = <T extends Props>(nodeId: NodeId) => {
    const [node, setNode] = useState<GraphNode<T>>();
    const graph = useContext(GraphContext);

    useEffect(() => {
        if(graph) {
            const sub = graphGet(graph, nodeId).subscribe(({node}) => setNode(node as GraphNode<T>));
            return () => sub.unsubscribe()
        }
    }, [graph]);
    return node;
};

export const useGraphPut = <T extends Props>() => {
    const graph: Graph = useContext(GraphContext);

    return (label: string, nodeId: NodeId, props: T) => {
        return graphPut(graph, nodeId, label, props);
    }
}

export const useGraphPutEdge = <T extends Props>() => {
    const graph: Graph = useContext(GraphContext);

    return (rel: string, edgeId: EdgeId, from: NodeId, to: NodeId, props: T) => {
        return graphPutEdge(graph, edgeId, rel, from, to, props);
    }
}




export const ReactGraph: React.FC<PropsWithChildren<{graph?: Graph}>> = ({graph, children}) => {
    const [myGraph, setMyGraph] = useState<Graph>();
    useEffect(() => {
        graph ? setMyGraph(graph) : createNewGraph();

        function createNewGraph() {
            const sub = graphOpen({
                graphId: newUid(),
                handlers: {
                    putNode: handlers([levelStorePutNodeHandler({})]),
                    getNode: handlers([levelStoreGetNodeHandler({})]),
                    nodesByLabel: handlers([levelStoreNodesByLabelHandler({})]),
                    nodesByProp: handlers([levelStoreNodesByPropHandler({})]),
                    putEdge: handlers([levelStorePutEdgeHandler({})]),
                    getEdge: handlers([levelStoreGetEdgeHandler({})]),
                    getRelationships: handlers([levelStoreGetRelationshipsHandler({})])
                }
            }).subscribe(graph => setMyGraph(graph));
            return () => sub.unsubscribe();
        }
    }, [])

    return myGraph?.graphId ? (
        <GraphContext.Provider value={myGraph}>
            {children}
            </GraphContext.Provider>
    ) : <div>'No graph'</div>
};
