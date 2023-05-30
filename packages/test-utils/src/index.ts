import type {Graph, GraphOpts} from "@end-game/graph";
import {graphOpen, graphPutNode, LogLevel, newGraphNode, newUid} from "@end-game/graph";
import {from, mergeMap, of, scan, skip, switchMap} from "rxjs";
import {levelStoreHandlers} from "@end-game/level-store";
import {authHandlers} from "@end-game/pwd-auth";
import {dialPeer, p2pHandlers} from "@end-game/p2p";


export const getAGraph = (opts: GraphOpts = {graphId: newUid()}) => graphOpen(opts).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
);

export const startTestNet = (nodes: number[][]) =>
    from(nodes).pipe(
        mergeMap((peers, nodeNo) => startTestNode(nodeNo, peers)),
        scan((nodes, {graph}, idx) => ({...nodes, [`node${idx}`]: graph}), {} as Record<`node${number}`, Graph>),
        skip(nodes.length - 1),
    );


export const startTestNode = (nodeNo: number, peers: number[] = []) => graphOpen({graphId: `node-${nodeNo}`, logLevel: LogLevel.DEBUG}).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph)),
    switchMap(graph => p2pHandlers(graph, {listeningPort: 11110 + nodeNo})),
    switchMap(graph => peers.length ? from(peers).pipe(
        mergeMap(peerNo => dialPeer(graph, {url: `ws://localhost:${11110 + peerNo}`, redialInterval: 1})),
        skip(peers.length - 1)
    ) : of({graph}))
);

export const addThingNode = (graph: Graph, n: number) =>
    graphPutNode(graph, newGraphNode(`thing${n}`, 'thing', {name: `thing${n}`}));


