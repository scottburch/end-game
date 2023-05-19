import type {EdgeId, Graph, GraphEdge, GraphId, GraphNode, NodeId, Props} from "@end-game/graph";

import {map, of, switchMap, tap} from "rxjs";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {appendHandler, chainNext, newRxjsChain, RxjsChainFn} from "@end-game/rxjs-chain";
import {startServer} from "./server.js";
import {graphGet, graphGetEdge, graphGetRelationships, graphPutEdge, graphPutNode} from "@end-game/graph";

export type P2pOpts = {
    listeningPort?: number,
    peerId?: string,
}

export type P2pMsg<Cmd extends string = string, Data extends Object = Object> = {
    cmd: Cmd,
    data: Data
};

export type GraphP2pHandler<T extends keyof GraphWithP2p['chains']> = RxjsChainFn<GraphWithP2p['chains'][T]['type']>


export type GraphWithP2p = Graph & {
    peerId: string
    peerConnections: Set<GraphId>
    chains: Graph['chains'] & {
        peerIn: RxjsChain<{ graph: Graph, msg: P2pMsg }>
        peersOut: RxjsChain<{ graph: Graph, msg: P2pMsg }>
    }
}


// *** Stuff to output

export const p2pHandlers = (graph: Graph, opts: P2pOpts) =>
    of(graph as GraphWithP2p).pipe(
        tap(graph => graph.peerId = opts.peerId || graph.graphId),
        tap(graph => graph.peerConnections = graph.peerConnections || new Set()),
        tap(addChainsToGraph),
        switchMap(graph => opts.listeningPort ? startServer(graph, opts.listeningPort) : of(graph)),
        tap(graph => {
            appendHandler((graph as GraphWithP2p).chains.peerIn, 'p2p', peerInHandler);
            appendHandler(graph.chains.putNode, 'p2p', putNodeHandler);
            appendHandler(graph.chains.putEdge, 'p2p', putEdgeHandler);
            appendHandler(graph.chains.getNode, 'p2p', getNodeHandler);
            appendHandler(graph.chains.getRelationships, 'p2p', getRelationshipsHandler);
            appendHandler(graph.chains.getEdge, 'p2p', getEdgeHandler);
        }),
    );


const addChainsToGraph = (graph: GraphWithP2p) => {
    graph.chains.peerIn = graph.chains.peerIn || newRxjsChain();
    graph.chains.peersOut = graph.chains.peersOut || newRxjsChain();
};


const putNodeHandler: GraphP2pHandler<'putNode'> = ({graph, node}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'putNode', data: node}
    }).subscribe();
    return of({graph, node});
};

const putEdgeHandler: GraphP2pHandler<'putEdge'> = ({graph, edge}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'putEdge', data: edge}
    }).subscribe();
    return of({graph, edge});
};

const getNodeHandler: GraphP2pHandler<'getNode'> = ({graph, nodeId, node}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getNode', data: nodeId}
    }).subscribe();
    return of({graph, nodeId, node});
};

const getRelationshipsHandler: GraphP2pHandler<'getRelationships'> = ({graph, nodeId, rel, reverse, relationships}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getRelationships', data: {nodeId, rel, reverse}}
    }).subscribe()
    return of({graph, nodeId, rel, reverse, relationships});
};

const getEdgeHandler: GraphP2pHandler<'getEdge'> = ({graph, edgeId, edge}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getEdge', data: edgeId}
    })
    return of({graph, edgeId, edge});
}


// ****** PEER IN STUFF


const peerInHandler: GraphP2pHandler<'peerIn'> = ({graph, msg}) =>
    of({graph, msg}).pipe(
        tap(({msg}) => msg.cmd === 'putNode' && doPutNodeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'putEdge' && doPutEdgeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'getNode' && doGetNodeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'getRelationships' && doGetRelationshipsIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'getEdge' && doGetEdgeIn(graph, msg).subscribe())
    )


const doPutNodeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'putNode', GraphNode<Props>>).pipe(
        switchMap(msg => graphPutNode(graph, msg.data))
    );

const doPutEdgeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'putEdge', GraphEdge<Props>>).pipe(
        switchMap(msg =>
            graphPutEdge(graph, msg.data)
        )
    );

const doGetNodeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'getNode', NodeId>).pipe(
        switchMap(msg => graphGet(graph, msg.data)),
        tap(({node}) => node?.nodeId && chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: node}
        }).subscribe())
    );

const doGetRelationshipsIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'getRelationships', { nodeId: string, rel: string, reverse: boolean, relationships: [] }>).pipe(
        switchMap(msg => graphGetRelationships(graph, msg.data.nodeId, msg.data.rel, {reverse: msg.data.reverse}).pipe(
            map(({relationships}) => ({relationships, msg}))
        )),
        tap(({relationships, msg}) => relationships.forEach(relationship =>
            graphGetEdge(graph, relationship.edgeId).pipe(
                switchMap(({edge}) => chainNext((graph as GraphWithP2p).chains.peersOut, {
                            graph,
                            msg: {cmd: 'putEdge', data: edge}
                        }
                    )
                )
            ).subscribe()
        ))
    );

const doGetEdgeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'getEdge', EdgeId>).pipe(
        switchMap(msg => graphGetEdge(graph, msg.data)),
        tap(({edge}) => edge?.edgeId && chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: edge}
        }).subscribe())
    )







