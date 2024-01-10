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
    nodesByProp, asGraphId, newEdge,
} from "@end-game/graph";
import type {PropsWithChildren} from 'react';
import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";
import {catchError, combineLatest, filter, of, switchMap, tap, throwError} from "rxjs";
import type {GraphWithAuth} from '@end-game/pwd-auth'
import {authHandlers, graphAuth, graphNewAuth, graphUnauth} from "@end-game/pwd-auth";
import {newNode} from "@end-game/graph";
import {levelStoreHandlers} from "@end-game/level-store";
import type {GraphWithP2p} from '@end-game/p2p'
import {asPeerId, dialPeer, newHost, p2pHandlers} from "@end-game/p2p";
import type {DialerOpts} from "@end-game/p2p";
import type {GraphHandlerProps} from "@end-game/graph";


type Graphs = {netGraph: Graph, memGraph: Graph, localGraph: Graph};
type GraphOpts = {graphName?: 'net' | 'local' | 'mem'}

const GraphsContext: React.Context<Graphs> = createContext({} as Graphs);


export const useGraphs = () => useContext(GraphsContext);

export const useDialer = (hostId: string) => {
    const graphs = useGraphs();
    return (opts: DialerOpts) => dialPeer(newHost({
        graphs: [graphs.netGraph as GraphWithP2p],
        hostId: asPeerId(hostId),
        listeningPort: 0
    }), opts);
}

export const useAuth = () =>  {
    const graphs = useGraphs();
    const [auth, setAuth] = useState<{username: string, nodeId: NodeId}>({nodeId: (graphs.netGraph as GraphWithAuth).user?.nodeId || '', username: (graphs.netGraph as GraphWithAuth).user?.username || ''});


    useEffect(() => {
        setAuth({nodeId: (graphs.netGraph as GraphWithAuth).user?.nodeId || '', username: (graphs.netGraph as GraphWithAuth).user?.username || ''});
        const authChangedSub = (graphs.netGraph as GraphWithAuth).chains.authChanged.pipe(
            tap(({graph}) => setAuth({nodeId: (graph as GraphWithAuth).user?.nodeId || '', username: (graph as GraphWithAuth).user?.username || ''}))
        ).subscribe()

        return () => authChangedSub.unsubscribe();
    }, [graphs])

    return auth;
}

const whichGraph = (graphs: Graphs, graphName: GraphOpts['graphName']) =>
    graphs[`${graphName || 'net'}Graph`];

export const useGraphNodesByLabel = <T extends Props>(label: string, opts: RangeOpts & GraphOpts = {}) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graphs = useGraphs();

    useEffect(() => {
        if (graphs) {
            const sub = of(undefined).pipe(
                switchMap(() => nodesByLabel(whichGraph(graphs, opts.graphName), label, opts)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => {
                sub.unsubscribe()
            };
        }
    }, [graphs, JSON.stringify(opts)]);
    return nodes;
}

export const useGraphNodesByProp = <T extends Props>(label: string, key: keyof T & string, value: any, opts: RangeOpts & GraphOpts = {}) => {
    const [nodes, setNodes] = useState<GraphNode<T>[]>([]);
    const graphs = useGraphs();

    useEffect(() => {
        if (graphs) {
            const sub = of(true).pipe(
                switchMap(() => nodesByProp<T>(whichGraph(graphs, opts.graphName), label, key, value, opts)),
                tap(({nodes}) => setNodes(nodes as GraphNode<T>[]))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graphs, label, key, value]);
    return nodes;
}

export const useGraphRelationships = (nodeId: NodeId, rel: string, opts: { reverse?: boolean} & GraphOpts = {}) => {
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const graphs = useGraphs();

    useEffect(() => {
        if (graphs) {
            const sub = of(true).pipe(
                switchMap(() => getRelationships(whichGraph(graphs, opts.graphName), nodeId, rel, opts)),
                tap(({relationships}) => setRelationships(relationships))
            ).subscribe();
            return () => sub.unsubscribe();
        }
    }, [graphs]);
    return relationships;

}

export const useGraphNode = <T extends Props>(nodeId: NodeId, opts: GraphOpts = {}) => {
    const [node, setNode] = useState<GraphNode<T>>();
    const graphs = useGraphs();

    useEffect(() => {
        !graphs && console.error('useGraphGet() called outside of a graph context');
        if (graphs && nodeId) {
            const sub = getNode(whichGraph(graphs, opts.graphName), nodeId, {}).pipe(
                filter(({node}) => !!node?.nodeId),
                tap(({node}) => setNode(node as GraphNode<T>))
            ).subscribe();
            return () => {
                sub.unsubscribe()
            };
        } else {
            setNode(undefined);
        }
    }, [nodeId]);
    return node;
};

export const useGraphEdge = <T extends Props>(edgeId: EdgeId, opts: GraphHandlerProps<'getEdge'>['opts'] & GraphOpts = {}) => {
    const [edge, setEdge] = useState<GraphEdge<T>>();
    const graphs = useGraphs();

    useEffect(() => {
        if (graphs && edgeId) {
            const sub = getEdge(whichGraph(graphs, opts.graphName), edgeId, opts).subscribe(({edge}) => setEdge(edge as GraphEdge<T>))
            return () => sub.unsubscribe();
        }
    }, [graphs, edgeId]);
    return edge;
}

export const useGraphPut = <T extends Props>() => {
    const graphs = useGraphs();

    return (label: string, nodeId: NodeId, props: T, opts: GraphOpts = {}) =>
        of(newNode(nodeId, label, props)).pipe(
            switchMap(node => putNode(whichGraph(graphs, opts.graphName), node))
        );
};

export const useNewAccount = () => {
    const graphs = useGraphs();

    return (username: string, password: string) => {
        return graphNewAuth(graphs.netGraph, username, password);
    }
}

export const useGraphLogin = () => {
    const graphs = useGraphs();

    return (username: string, password: string) =>
        graphAuth(graphs.netGraph, username, password);
};

export const useGraphLogout = () => {
    const graphs= useGraphs();

    return () => graphUnauth(graphs.netGraph);
}


export const useGraphPutEdge = <T extends Props>() => {
    const graphs = useGraphs();

    return (rel: string, edgeId: EdgeId, from: NodeId, to: NodeId, props: T, opts: {memGraph?: boolean} = {}) => {
        return putEdge(opts.memGraph ? graphs.memGraph : graphs.netGraph, newEdge(edgeId, rel, from, to, props)).pipe(
            catchError(err => throwError(err.code || err))
        );
    }
}

export type ReactGraphProps =  {
    graphId: string
    persistent?: boolean
}

export const ReactGraph: React.FC<PropsWithChildren<ReactGraphProps>> = (props) => {
    const [myGraphs, setMyGraphs] = useState<Graphs>();


    useEffect(() => {
        const sub = combineLatest<[Graph, Graph, Graph]>([
            createNewDiskGraph(),
            createNewMemGraph(),
            createLocalGraph()
        ]).pipe(
            tap(([netGraph, memGraph, localGraph]) => setMyGraphs({memGraph, netGraph, localGraph})),
        ).subscribe()

        function createLocalGraph() {
            return graphOpen({
                graphId: asGraphId(props.graphId + '-local')
            }).pipe(
                switchMap(graph => levelStoreHandlers(graph, {dir: props.graphId + '-local'}))
            )
        }

        function createNewMemGraph() {
            return graphOpen({
                graphId: asGraphId(props.graphId + '-mem')
            }).pipe(
                switchMap(graph => levelStoreHandlers(graph)),
            )
        }

        function createNewDiskGraph() {
            return graphOpen({
                graphId: asGraphId(props.graphId)
            }).pipe(
                switchMap(graph => levelStoreHandlers(graph, {dir: props.persistent ? props.graphId : undefined})),
                switchMap(graph => authHandlers(graph)),
                switchMap(graph => p2pHandlers(graph))
            )
        }
        return () => sub.unsubscribe();
    }, [])

    return myGraphs?.netGraph.graphId ? (
        <GraphsContext.Provider value={myGraphs}>
            {props.children}
        </GraphsContext.Provider>
    ) : <div>'No graph'</div>
};
