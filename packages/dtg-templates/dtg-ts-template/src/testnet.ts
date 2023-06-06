import {from, mergeMap, of, scan, skip, switchMap, tap} from "rxjs";
import {Graph, graphOpen, LogLevel} from "@end-game/graph";
import {levelStoreHandlers} from "@end-game/level-store";
import {authHandlers} from "@end-game/pwd-auth";
import {dialPeer, p2pHandlers} from "@end-game/p2p";


setTimeout(() =>
    startTestNet([[1], []]).pipe(
        tap(() => console.log('TESTNET STARTED!!!'))
    ).subscribe()
);


const startTestNet = (nodes: number[][]) =>
    from(nodes).pipe(
        mergeMap((peers, nodeNo) => startTestNode(nodeNo, peers)),
        scan((nodes, {graph}, idx) => ({...nodes, [`node${idx}`]: graph}), {} as Record<`node${number}`, Graph>),
        skip(nodes.length - 1),
    );


const startTestNode = (nodeNo: number, peers: number[] = []) => graphOpen({
    graphId: `node-${nodeNo}`,
    logLevel: LogLevel.DEBUG
}).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph)),
    switchMap(graph => p2pHandlers(graph, {listeningPort: 11110 + nodeNo})),
    switchMap(graph => peers.length ? from(peers).pipe(
        mergeMap(peerNo => dialPeer(graph, {url: `ws://localhost:${11110 + peerNo}`, redialInterval: 1})),
        skip(peers.length - 1)
    ) : of({graph}))
);



