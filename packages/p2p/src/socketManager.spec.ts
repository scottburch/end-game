import {startTestNet} from "@end-game/test-utils";
import {bufferTime, filter, firstValueFrom, merge, of, switchMap, tap, timer} from "rxjs";
import {asNodeId, newNode, putNode} from "@end-game/graph";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {expect} from "chai";

describe('socket manager', function() {
    this.timeout(120_000);
    it('should never send a msg back on a connection it arrived on', () =>
        firstValueFrom(startTestNet([[1], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                tap(() => timer(100).pipe(
                        switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'scott')),
                        switchMap(() => graphAuth(host0.graphs[0], 'scott', 'scott')),
                        switchMap(() => putNode(host0.graphs[0], newNode(asNodeId('mine'), 'mine', {})))
                    ).subscribe()
                ),
                switchMap(() => merge(
                    host0.graphs[0].chains.peerIn,
                    host1.graphs[0].chains.peerIn
                )),
                filter(({msg}) => (msg.data as any).label !== 'auth'),
                filter(({msg}) => msg.cmd === 'putNode'),
                bufferTime(5000),
                tap(arr => expect(arr.length).to.equal(1))
            ))
        ))
    );

    it('should send a ping every 30 seconds', () =>
        firstValueFrom(startTestNet([[1], []]).pipe(
            switchMap(({host0}) => of(undefined).pipe(
                switchMap(() => host0.graphs[0].chains.peerIn),
                filter(({msg}) => msg.cmd === 'ping')
            ))
        ))
    );

});


