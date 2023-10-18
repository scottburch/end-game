import type {Graph, GraphOpts, Props} from "@end-game/graph";
import {asGraphId, asNodeId, graphOpen, LogLevel, newNode, newUid, putNode} from "@end-game/graph";
import {from, map, mergeMap, Observable, of, scan, skip, switchMap, timer} from "rxjs";
import {levelStoreHandlers} from "@end-game/level-store";
import {authHandlers} from "@end-game/pwd-auth";
import type {Host} from '@end-game/p2p'
import {asPeerId, dialPeer, newHost, p2pHandlers, startServer} from "@end-game/p2p";
import detect from 'detect-port'
import ld from 'lodash'


export const getAGraph = (opts: GraphOpts = {graphId: asGraphId(newUid())}) => graphOpen(opts).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
);


export const startTestNet = (nodes: number[][], opts: {graphId?: string, basePort?: number} = {}) =>
    findBasePort(opts.basePort || 11110).pipe(
        switchMap(basePort => from(nodes).pipe(
            mergeMap((peers, nodeNo) => startTestNode(nodeNo, peers, {basePort, graphId: opts.graphId})),
            scan((nodes, {host}, idx) => ({...nodes, [`host${idx}`]: host}), {} as Record<`host${number}`, Host>),
            skip(nodes.length - 1),
        ))
    );


export const startTestNode = (nodeNo: number, peers: number[] = [], opts: {basePort?: number, graphId?: string} = {}) =>
    graphOpen({graphId: asGraphId(opts.graphId || 'testnet'), logLevel: LogLevel.DEBUG}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => p2pHandlers(graph)),
        switchMap(graph => startServer(newHost({
            hostId: asPeerId(`host-${nodeNo}`),
            graphs: [graph],
            listeningPort: (opts.basePort || 11110) + nodeNo
        }))),
        switchMap(host => peers.length ? from(peers).pipe(
            mergeMap(peerNo => dialPeer(host, {url: `ws://localhost:${(opts.basePort || 11110) + peerNo}`, redialInterval: 1})),
            skip(peers.length - 1),
            map(() => ({host}))
        ) : of({host}))
    );

export const addThingNode = (graph: Graph, n: number, props: Props = {}) =>
    of(ld.padStart(n.toString(), 4, '0')).pipe(
        switchMap(padNum =>  putNode(graph, newNode(asNodeId(`thing${padNum}`), 'thing', {name: `thing${padNum}`, ...props})))
    )


const findBasePort = (basePort = 11110): Observable<number> => from(detect(basePort)).pipe(
    switchMap(port => port === basePort ? of(port) : timer(Math.random() * 1000).pipe(() => findBasePort(basePort + 10)))
);