import type {EdgeId, Graph, GraphEdge, GraphNode, NodeId, Props, Relationship} from '@end-game/graph'
import {
    graphGet,
    graphGetEdge,
    graphGetRelationships,
    graphOpen,
    graphPut,
    graphPutEdge,
    levelStoreHandlers,
    newUid,
    nodesByLabel,
    nodesByProp,
} from "@end-game/graph";
import type {PropsWithChildren} from 'react';
import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";
import {catchError, of, switchMap, tap, throwError} from "rxjs";
import type {GraphWithAuth} from '@end-game/auth'
import {authHandlers, graphAuth, graphNewAuth} from "@end-game/auth";


const GraphContext: React.Context<Graph> = createContext({} as Graph);

export const useGraph = () => useContext(GraphContext);


export const useAuth = () =>  {
    const [auth, setAuth] = useState<{username: string}>({username: ''});
    let graph = useGraph();


    useEffect(() => {
        setAuth({username: (graph as GraphWithAuth).user?.username || ''});
        const authChangedSub = (graph as GraphWithAuth).chains.authChanged.pipe(
            tap(({graph}) => setAuth({username: (graph as GraphWithAuth).user?.username || ''}))
        ).subscribe()

        return () => authChangedSub.unsubscribe();
    }, [graph])

    return auth;
}

export const useGraphNodesByLabel = <T extends Props>(label: string) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graph = useGraph();

    useEffect(() => {
        if (graph) {
            const sub = of(true).pipe(
                switchMap(() => nodesByLabel(graph, label)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => {
                sub.unsubscribe()
            };
        }
    }, [graph]);
    return nodes;
}

export const useGraphNodesByProp = <T extends Props>(label: string, key: string, value: any) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graph = useGraph();

    useEffect(() => {
        if (graph) {
            const sub = of(true).pipe(
                switchMap(() => nodesByProp(graph, label, key, value)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graph]);
    return nodes;
}

export const useGraphRelationships = (nodeId: NodeId, rel: string, opts: { reverse?: boolean }) => {
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const graph = useGraph();

    useEffect(() => {
        if (graph) {
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
    const graph = useGraph();

    useEffect(() => {
        !graph && console.error('useGraphGet() called outside of a graph context');
        if (graph && nodeId) {
            const sub = graphGet(graph, nodeId).pipe(
                tap(({node}) => setNode(node as GraphNode<T>))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, []);
    return node;
};

export const useGraphEdge = <T extends Props>(edgeId: EdgeId) => {
    const [edge, setEdge] = useState<GraphEdge<T>>();
    const graph = useGraph();

    useEffect(() => {
        if (graph && edgeId) {
            const sub = graphGetEdge(graph, edgeId).subscribe(({edge}) => setEdge(edge as GraphEdge<T>))
            return () => sub.unsubscribe();
        }
    }, [graph, edgeId]);
    return edge;
}

export const useGraphPut = <T extends Props>() => {
    const graph: Graph = useGraph();

    return (label: string, nodeId: NodeId, props: T) => {
        return graphPut(graph, nodeId, label, props);
    }
};

export const useNewAccount = () => {
    const graph: Graph = useGraph();

    return (username: string, password: string) => {
        return graphNewAuth(graph, username, password);
    }
}

export const useGraphLogin = () => {
    const graph: Graph = useGraph();

    return (username: string, password: string) => {
        return graphAuth(graph, username, password)
    }
};



export const useGraphPutEdge = <T extends Props>() => {
    const graph: Graph = useGraph();

    return (rel: string, edgeId: EdgeId, from: NodeId, to: NodeId, props: T) => {
        return graphPutEdge(graph, edgeId, rel, from, to, props).pipe(
            catchError(err => throwError(err.code || err))
        );
    }
}

export const ReactGraph: React.FC<PropsWithChildren<{ graph?: Graph }>> = ({graph, children}) => {
    const [myGraph, setMyGraph] = useState<Graph>();


    useEffect(() => {
        graph ? setMyGraph(graph) : createNewGraph();

        function createNewGraph() {
            const sub = graphOpen({
                graphId: newUid()
            }).pipe(
                switchMap(graph => levelStoreHandlers(graph)),
                switchMap(graph => authHandlers(graph)),
                tap(graph => setMyGraph(graph)),
                switchMap(graph => (graph as GraphWithAuth).chains.authChanged),
                tap(({graph}) => setMyGraph(graph)),
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [])

    return myGraph?.graphId ? (
        <GraphContext.Provider value={myGraph}>
            {children}
        </GraphContext.Provider>
    ) : <div>'No graph'</div>
};
