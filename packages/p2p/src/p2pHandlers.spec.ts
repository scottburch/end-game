import {graphOpen} from "@end-game/graph";
import {bufferCount, combineLatest, delay, firstValueFrom, map, mergeMap, of, range, switchMap, tap, timer} from "rxjs";
import {GraphWithP2p, p2pHandlers} from "./p2pHandlers.js";
import {chainNext} from "@end-game/rxjs-chain";
import {expect} from "chai";
import {dialPeer} from "./dialer.js";

describe('p2p handlers', () => {
    it('should setup peer chains', () =>
        firstValueFrom(graphOpen().pipe(
            switchMap(graph => p2pHandlers(graph, {})),
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

    it('should dial a peer', () =>
        firstValueFrom(range(1, 2).pipe(
            mergeMap(() => graphOpen()),
            mergeMap((graph, idx) => p2pHandlers(graph, {listeningPort: 11110 + idx})),
            bufferCount(2),
            switchMap(([server, client]) => of({server, client}).pipe(
                switchMap(() => dialPeer(client, {url: 'ws://localhost:11110'}))
            )),
            delay(1000),
            tap(x => x)

        ))
    )
});