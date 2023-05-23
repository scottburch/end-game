import type {Graph} from "@end-game/graph";
import {GraphHandler} from "@end-game/graph";
import {of, switchMap, tap} from "rxjs";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {appendHandler, chainNext, newRxjsChain} from "@end-game/rxjs-chain";
import {startServer} from "./server.js";

export type P2pOpts = {
    listeningPort?: number,
    peerId?: string,
}

export type P2pMsg<Cmd extends string = string, Data extends Object = Object> = {
    peerId: string,
    cmd: Cmd,
    data: Data
};

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
        tap(graph => appendHandler(graph.chains.putNode, 'p2p', putNodeHandler)),
        tap(graph => appendHandler(graph.chains.putEdge, 'p2p', putEdgeHandler)),
    );


const addChainsToGraph = (graph: GraphWithP2p) => {
    graph.chains.peerIn = graph.chains.peerIn || newRxjsChain();
    graph.chains.peersOut = graph.chains.peersOut || newRxjsChain();
};


const putNodeHandler: GraphHandler<'putNode'> = ({graph, node}) => {
        chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {peerId: (graph as GraphWithP2p).peerId, cmd: 'putNode', data: node}
        }).subscribe();
        return of({graph, node});
    };

const putEdgeHandler: GraphHandler<'putEdge'> = ({graph, edge}) => {
        chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {peerId: (graph as GraphWithP2p).peerId, cmd: 'putEdge', data: edge}
        }).subscribe();
        return of({graph, edge});
    };






