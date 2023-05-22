import type {Graph, GraphEdge, GraphNode, Props} from "@end-game/graph";
import {GraphHandler, graphPutEdge, graphPutNode} from "@end-game/graph";
import {fromEvent, map, mergeMap, Observable, of, Subject, switchMap, tap} from "rxjs";
import WS from "isomorphic-ws";
import {deserializer, serializer} from "@end-game/utils/serializer";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {chainNext, newRxjsChain} from "@end-game/rxjs-chain";
import {startServer} from "./server.js";

export type P2pOpts = {
    listeningPort?: number
}

export type P2pMsg<Cmd extends string = string, Data extends Object = Object> = {peerId: string, cmd: Cmd, data: Data};

export type GraphWithP2p = Graph & {
    chains: Graph['chains'] & {
        peerIn: RxjsChain<{ graph: Graph, msg: P2pMsg}>
        peersOut: RxjsChain<{ graph: Graph, msg: P2pMsg}>
    }
}

export const p2pHandlers = (graph: Graph, opts: P2pOpts) => of(graph as GraphWithP2p).pipe(
    tap(addChainsToGraph),
    switchMap(graph => opts.listeningPort ? startServer(graph, opts.listeningPort) : of(graph)),
);

const addChainsToGraph = (graph: GraphWithP2p) => {
    graph.chains.peerIn = graph.chains.peerIn || newRxjsChain();
    graph.chains.peersOut = graph.chains.peersOut || newRxjsChain();
}






