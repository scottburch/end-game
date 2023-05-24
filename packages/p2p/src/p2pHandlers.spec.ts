import {
    GraphEdge,
    GraphNode,
    graphOpen,
    graphPutEdge,
    graphPutNode,
    newGraphEdge,
    newGraphNode, nodesByLabel,
    Props
} from "@end-game/graph";
import {combineLatest, filter, firstValueFrom, map, of, switchMap, tap, timer} from "rxjs";
import {GraphWithP2p, p2pHandlers} from "./p2pHandlers.js";
import {chainNext} from "@end-game/rxjs-chain";
import {expect} from "chai";
import {startTestNet} from "./test/testUtils.js";
import {graphAuth, graphNewAuth} from "@end-game/auth";

describe('p2p handlers', () => {
    it('should setup peer chains', () =>
        firstValueFrom(graphOpen().pipe(
            switchMap(graph => p2pHandlers(graph, {peerId: 'test'})),
            map(graph => graph as GraphWithP2p),
            tap(graph => timer(1).pipe(
                switchMap(() => chainNext(graph.chains.peerIn, {graph, msg: {cmd: 'peer-in', data: {}}})),
                switchMap(() => chainNext(graph.chains.peersOut, {graph, msg: {cmd: 'peers-out', data: {}}})),
            ).subscribe()),
            switchMap(graph => combineLatest([
                graph.chains.peerIn,
                graph.chains.peersOut
            ])),
            tap(([{msg: peerIn}, {msg: peersOut}]) => {
                expect(peerIn.cmd).to.equal('peer-in');
                expect(peersOut.cmd).to.equal('peers-out');
            })
        )
    ));

    it('should put a putNode onto the peersOut', () =>
        firstValueFrom(graphOpen().pipe(
            switchMap((graph) => p2pHandlers(graph, {listeningPort: 11110, peerId: 'test'})),
            tap(graph => timer(1).pipe(
                switchMap(() => graphPutNode(graph, newGraphNode('node1', 'thing', {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            tap(({msg}) => {
                expect(msg.cmd).to.equal('putNode');
                expect((msg.data as GraphNode<Props>).label).to.equal('thing')
            })
        ))
    );

    it('should put a putEdge onto the peersOut', () =>
        firstValueFrom(graphOpen().pipe(
            switchMap((graph) => p2pHandlers(graph, {listeningPort: 11110, peerId: 'test'})),
            tap(graph => timer(1).pipe(
                switchMap(() => graphPutEdge(graph, newGraphEdge('edge1', 'friend', 'node1', 'node2', {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            map(({msg}) => ({msg, edge: (msg.data as GraphEdge<Props>)})),
            tap(({msg, edge}) => {
                expect(msg.cmd).to.equal('putEdge');
                expect(edge.from).to.equal('node1');
                expect(edge.to).to.equal('node2');
                expect(edge.rel).to.equal('friend');
            })
        ))
    );

    it.skip('should send a putNode to a remote peer', () =>
        firstValueFrom(startTestNet([[1], []]).pipe(
            switchMap(([{graph:p0}, {graph: p1}]) => of({p0, p1}).pipe(
                tap(() => timer(1).pipe(
                    switchMap(() => graphNewAuth(p0, 'scott', 'pass')),
                    switchMap(() => graphAuth(p0, 'scott', 'pass')),
                    switchMap(() => graphPutNode(p0, newGraphNode('', 'thing', {name: 'thing1'})))
                ).subscribe()),
                switchMap(() => nodesByLabel(p1, 'auth')),
                filter(({nodes}) => !!nodes.length),

                // TODO: Causing NOT_LOGGED_IN error for some reason
                switchMap(() => nodesByLabel(p1, 'thing')),
                filter(({nodes}) => !!nodes.length),
            )),
        ))
    );
});