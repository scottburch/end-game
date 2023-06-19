import type {
    EdgeId,
    Graph,
    GraphEdge,
    GraphNode,
    NodeId,
    Props,
    RangeOpts,
    Relationship
} from '@end-game/graph'
import {
    getNode,
    getEdge,
    getRelationships,
    graphOpen,
    putNode,
    putEdge,
    nodesByLabel,
    nodesByProp, newGraphEdge, asGraphId,
} from "@end-game/graph";
import type {PropsWithChildren} from 'react';
import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";
import {catchError, filter, of, switchMap, tap, throwError} from "rxjs";
import type {GraphWithAuth} from '@end-game/pwd-auth'
import {authHandlers, graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {newNode} from "@end-game/graph";
import {levelStoreHandlers} from "@end-game/level-store";
import type {GraphWithP2p} from '@end-game/p2p'
import {asPeerId, dialPeer, newDialer, p2pHandlers} from "@end-game/p2p";
import type {DialerOpts} from "@end-game/p2p";
import type {GraphHandlerProps} from "@end-game/graph";


const GraphContext: React.Context<Graph> = createContext({} as Graph);

export const useGraph = () => useContext(GraphContext);

export const useDialer = (peerId: string) => {
    const graph = useGraph();
    return (opts: DialerOpts) => dialPeer(newDialer(graph as GraphWithP2p, asPeerId(peerId)), opts);
}

export const useAuth = () =>  {
    const [auth, setAuth] = useState<{username: string, nodeId: string}>({username: '', nodeId: ''});
    const graph = useGraph();


    useEffect(() => {
        setAuth({nodeId: (graph as GraphWithAuth).user?.nodeId || '', username: (graph as GraphWithAuth).user?.username || ''});
        const authChangedSub = (graph as GraphWithAuth).chains.authChanged.pipe(
            tap(({graph}) => setAuth({nodeId: (graph as GraphWithAuth).user?.nodeId || '', username: (graph as GraphWithAuth).user?.username || ''}))
        ).subscribe()

        return () => authChangedSub.unsubscribe();
    }, [graph])

    return auth;
}

export const useGraphNodesByLabel = <T extends Props>(label: string, opts: RangeOpts = {}) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graph = useGraph();

    useEffect(() => {
        if (graph) {
            const sub = of(undefined).pipe(
                switchMap(() => nodesByLabel(graph, label, opts)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => {
                sub.unsubscribe()
            };
        }
    }, [graph]);
    return nodes;
}

export const useGraphNodesByProp = <T extends Props>(label: string, key: keyof T & string, value: any) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graph = useGraph();

    useEffect(() => {
        if (graph) {
            const sub = of(true).pipe(
                switchMap(() => nodesByProp<T>(graph, label, key, value)),
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
                switchMap(() => getRelationships(graph, nodeId, rel, opts)),
                tap(({relationships}) => setRelationships(relationships))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graph]);
    return relationships;

}

export const useGraphNode = <T extends Props>(nodeId: NodeId) => {
    const [node, setNode] = useState<GraphNode<T>>();
    const graph = useGraph();

    useEffect(() => {
        !graph && console.error('useGraphGet() called outside of a graph context');
        if (graph && nodeId) {
            const sub = getNode(graph, nodeId, {}).pipe(
                filter(({node}) => !!node?.nodeId),
                tap(({node}) => setNode(node as GraphNode<T>))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, []);
    return node;
};

export const useGraphEdge = <T extends Props>(edgeId: EdgeId, opts: GraphHandlerProps<'getEdge'>['opts']) => {
    const [edge, setEdge] = useState<GraphEdge<T>>();
    const graph = useGraph();

    useEffect(() => {
        if (graph && edgeId) {
            const sub = getEdge(graph, edgeId, opts).subscribe(({edge}) => setEdge(edge as GraphEdge<T>))
            return () => sub.unsubscribe();
        }
    }, [graph, edgeId]);
    return edge;
}

export const useGraphPut = <T extends Props>() => {
    const graph: Graph = useGraph();

    return (label: string, nodeId: NodeId, props: T) => {
        return putNode(graph, newNode(nodeId, label, props));
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
        return putEdge(graph, newGraphEdge(edgeId, rel, from, to, props)).pipe(
            catchError(err => throwError(err.code || err))
        );
    }
}

export type ReactGraphOpts =  {
    graphId: string
    persistent?: boolean
    peerId: string
}

export const ReactGraph: React.FC<PropsWithChildren<ReactGraphOpts>> = (props) => {
    const [myGraph, setMyGraph] = useState<Graph>();


    useEffect(() => {
        createNewGraph();

        function createNewGraph() {
            const sub = graphOpen({
                graphId: asGraphId(props.graphId)
            }).pipe(
                switchMap(graph => levelStoreHandlers(graph, {dir: props.persistent ? 'endgame' : undefined})),
                switchMap(graph => authHandlers(graph)),
                switchMap(graph => p2pHandlers(graph, {peerId: asPeerId(props.peerId)})),
                tap(graph => setMyGraph(graph)),
                switchMap(graph => (graph as GraphWithAuth).chains.authChanged),
                tap(({graph}) => setMyGraph(graph)),
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [])

    return myGraph?.graphId ? (
        <GraphContext.Provider value={myGraph}>
            {props.children}
        </GraphContext.Provider>
    ) : <div>'No graph'</div>
};
