import type {Graph, GraphOpts, Props} from "@end-game/graph";
import {graphOpen, putNode, LogLevel, newNode, newUid, asNodeId, asGraphId} from "@end-game/graph";
import {from, mergeMap, Observable, of, scan, skip, switchMap, timer} from "rxjs";
import {levelStoreHandlers} from "@end-game/level-store";
import {authHandlers} from "@end-game/pwd-auth";
import {dialPeer, p2pHandlers} from "@end-game/p2p";
import detect from 'detect-port'

export const getAGraph = (opts: GraphOpts = {graphId: asGraphId(newUid())}) => graphOpen(opts).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
);


export const startTestNet = (nodes: number[][]) =>
    findBasePort(11110).pipe(
        switchMap(basePort => from(nodes).pipe(
            mergeMap((peers, nodeNo) => startTestNode(nodeNo, peers, basePort)),
            scan((nodes, {graph}, idx) => ({...nodes, [`node${idx}`]: graph}), {} as Record<`node${number}`, Graph>),
            skip(nodes.length - 1),
        ))
    );


export const startTestNode = (nodeNo: number, peers: number[] = [], basePort: number = 11110) =>
    graphOpen({graphId: asGraphId(`node-${nodeNo}`), logLevel: LogLevel.DEBUG}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => p2pHandlers(graph, {listeningPort: basePort + nodeNo})),
        switchMap(graph => peers.length ? from(peers).pipe(
            mergeMap(peerNo => dialPeer(graph, {url: `ws://localhost:${basePort + peerNo}`, redialInterval: 1})),
            skip(peers.length - 1)
        ) : of({graph}))
    );

export const addThingNode = (graph: Graph, n: number, props: Props = {}) =>
    putNode(graph, newNode(asNodeId(`thing${n}`), 'thing', {name: `thing${n}`, ...props}));


const findBasePort = (basePort = 11110): Observable<number> => from(detect(basePort)).pipe(
    switchMap(port => port === basePort ? of(port) : timer(Math.random() * 1000).pipe(() => findBasePort(basePort + 10)))
);