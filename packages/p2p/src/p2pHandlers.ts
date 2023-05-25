import type {Graph, GraphEdge, GraphNode, Props} from "@end-game/graph";

import {of, switchMap, tap} from "rxjs";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {appendHandler, chainNext, newRxjsChain, RxjsChainFn} from "@end-game/rxjs-chain";
import {startServer} from "./server.js";
import {graphPutEdge, graphPutNode} from "@end-game/graph";

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
    chains: Graph['chains'] & {
        peerIn: RxjsChain<{ graph: Graph, msg: P2pMsg }>
        peersOut: RxjsChain<{ graph: Graph, msg: P2pMsg }>
    }
}

export const p2pHandlers = (graph: Graph, opts: P2pOpts) =>
    of(graph as GraphWithP2p).pipe(
        tap(graph => graph.peerId = opts.peerId || graph.graphId),
        tap(addChainsToGraph),
        switchMap(graph => opts.listeningPort ? startServer(graph, opts.listeningPort) : of(graph)),
        tap(graph => appendHandler((graph as GraphWithP2p).chains.peerIn, 'p2p', peerInHandler)),
        tap(graph => appendHandler(graph.chains.putNode, 'p2p', putNodeHandler)),
        tap(graph => appendHandler(graph.chains.putEdge, 'p2p', putEdgeHandler)),
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


const peerInHandler: GraphP2pHandler<'peerIn'> = ({graph, msg}) =>
    of({graph, msg}).pipe(
        tap(({msg}) => msg.cmd === 'putNode' && doPutNode(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'putEdge' && doPutEdge(graph, msg).subscribe())
    )


const doPutNode = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'putNode', GraphNode<Props>>).pipe(
        switchMap(msg => graphPutNode(graph, msg.data))
    );

const doPutEdge = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'putEdge', GraphEdge<Props>>).pipe(
        switchMap(msg =>
            graphPutEdge(graph, msg.data)
        )
    )





