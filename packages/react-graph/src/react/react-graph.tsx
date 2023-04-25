import {Graph, graphGet, GraphNode, graphOpen, graphPut, NodeId, nodesByLabel, Props} from "@end-game/graph/src/graph/graph.ts";
import React, {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {of, switchMap} from "rxjs";
import {newUid} from "@end-game/graph/src/utils/uid.ts";
import {handlers} from "@end-game/graph/src/handlers/handlers.ts";
import {
    levelStoreGetNodeHandler, levelStoreNodesByLabelHandler,
    levelStorePutNodeHandler
} from "@end-game/graph/src/handlers/store-handlers/levelStoreHandler.ts";

const GraphContext: React.Context<Graph> = createContext({} as Graph);

export const useGraph = () => useContext(GraphContext);

export const useGraphNodesByLabel = <T extends Props>(label: string) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>();
    const graph = useContext(GraphContext);

    useEffect(() => {
        if(graph) {
            const sub = of(true).pipe(
                switchMap(() => nodesByLabel(graph, label)),
            ).subscribe(({nodes}) => setNodes(nodes as GraphNode<T>[]));
            return () => sub.unsubscribe();
        }
    }, [graph]);
    return nodes;
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
                    nodesByLabel: handlers([levelStoreNodesByLabelHandler({})])
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
