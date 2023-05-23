import {GraphNode, graphOpen, graphPutNode, newGraphNode, Props} from "@end-game/graph";
import {combineLatest, firstValueFrom, map, switchMap, tap, timer} from "rxjs";
import {GraphWithP2p, p2pHandlers} from "./p2pHandlers.js";
import {chainNext} from "@end-game/rxjs-chain";
import {expect} from "chai";

describe('p2p handlers', () => {
    it('should setup peer chains', () =>
        firstValueFrom(graphOpen().pipe(
            switchMap(graph => p2pHandlers(graph, {peerId: 'test'})),
            map(graph => graph as GraphWithP2p),
            tap(graph => timer(1).pipe(
                switchMap(() => chainNext(graph.chains.peerIn, {graph, msg: {peerId: '', cmd: 'peer-in', data: {}}})),
                switchMap(() => chainNext(graph.chains.peersOut, {graph, msg: {peerId: '', cmd: 'peers-out', data: {}}})),
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
            switchMap((graph, idx) => p2pHandlers(graph, {listeningPort: 11110 + idx, peerId: 'test'})),
            tap(graph => timer(1).pipe(
                switchMap(() => graphPutNode(graph, newGraphNode('node1', 'thing', {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            tap(({msg}) => {
                expect(msg.peerId).to.equal('test');
                expect(msg.cmd).to.equal('putNode');
                expect((msg.data as GraphNode<Props>).label).to.equal('thing')
            })
        ))
    )
});