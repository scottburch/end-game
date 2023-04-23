import React, {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {delay, of, switchMap, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {Graph, graphGet, GraphNode, graphOpen, graphPut, NodeId, nodesByLabel, Props} from "../graph/graph.ts";
import {newUid} from "../utils/uid.ts";
import {handlers} from "../handlers/handlers.ts";
import {
    levelStoreGetNodeHandler,
    levelStoreNodesByLabelHandler,
    levelStorePutNodeHandler
} from "../handlers/store-handlers/levelStoreHandler.ts";


const useGraphNodesByLabel = <T extends Props>(label: string) => {
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

const useGraphGet = <T extends Props>(nodeId: NodeId) => {
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

const useGraphPut = <T extends Props>() => {
    const graph: Graph = useContext(GraphContext);

    return (label: string, props: T) => {
        return graphPut(graph, '', label, props);
    }
}

const GraphContext: React.Context<Graph> = createContext({} as Graph);


const ReactGraph: React.FC<PropsWithChildren> = ({children}) => {
    const [graph, setGraph] = useState<Graph>();
    useEffect(() => {
        const sub = graphOpen({
            graphId: newUid(),
            handlers: {
                putNode: handlers([levelStorePutNodeHandler({})]),
                getNode: handlers([levelStoreGetNodeHandler({})]),
                nodesByLabel: handlers([levelStoreNodesByLabelHandler({})])
            }
        }).subscribe(graph => setGraph(graph));
        return () => sub.unsubscribe();
    }, [])

    return graph?.graphId ? (
        <GraphContext.Provider value={graph}>
            {children}
        </GraphContext.Provider>
    ) : <div>'No graph'</div>
};

const Foo: React.FC = () => {
    const nodes = useGraphNodesByLabel('person');

    return <div>{nodes?.map(node => node.props.name)}</div>
}

export default function Body() {
    const graphPut = useGraphPut();
    const [nodeId, setNodeId] = useState<string>();


    useEffect(() => {
        setTimeout(() => {
            graphPut('person', {name: 'scott'}).subscribe(({nodeId}) => setNodeId(nodeId));
        }, 1000)
    }, [])

    return nodeId ? (<Foo />) : (<div>Loading...</div>);

}

const MyApp: React.FC = () => {
    return (
        <ReactGraph>
            <Body/>
        </ReactGraph>
    )
};

of(createRoot(document.querySelector('#app') as Element)).pipe(
    tap(root => root.render(<MyApp/>))
).subscribe();
