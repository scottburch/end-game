import {bufferCount, from, last, mergeMap, of, scan, skip, switchMap, take, tap, toArray} from "rxjs";
import {Graph, graphOpen, levelStoreHandlers} from "@end-game/graph";
import {authHandlers} from "@end-game/auth";
import {p2pHandlers} from "../p2pHandlers.js";
import {dialPeer} from "../dialer.js";

export const startTestNet = (nodes: number[][]) =>
    from(nodes).pipe(
        mergeMap((peers, nodeNo) => startTestNode(nodeNo, peers)),
        scan((nodes, {graph}, idx) => ({...nodes, [`node${idx}`]: graph}), {} as Record<`node${number}`, Graph>),
        skip(nodes.length - 1)
    );


export const startTestNode = (nodeNo: number, peers: number[] = []) => graphOpen({graphId: `node-${nodeNo}`}).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph)),
    switchMap(graph => p2pHandlers(graph, {listeningPort: 11110 + nodeNo})),
    switchMap(graph => peers.length ? from(peers).pipe(
        mergeMap(peerNo => dialPeer(graph, {url: `ws://localhost:${11110 + peerNo}`, redialInterval: 1}))
    ) : of({graph}))
)




