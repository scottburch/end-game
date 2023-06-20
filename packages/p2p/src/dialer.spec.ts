import {delay, filter, firstValueFrom, merge, Subscription, switchMap, take, tap} from "rxjs";
import {expect} from "chai";
import {startTestNet, startTestNode} from "@end-game/test-utils";
import {Host} from "./host.js";

describe("dialer", () => {
    it('should redial until it can get a connection', () =>
        firstValueFrom(startTestNode(0, [1]).pipe(
            delay(3000),
            switchMap(() => startTestNode(1)),
            switchMap(({host}) => host.graphs[0].chains.log),
            tap(({item}) => expect(item.code).to.equal('NEW_PEER_CONNECTION'))
        ))
    );

    it('should redial if a peer connection is lost', () => {
        let peer1: Host;
        let peer1Sub: Subscription;

        return firstValueFrom(startTestNode(0, [1]).pipe(
            tap(() => peer1Sub = startTestNode(1).subscribe(({host}) => peer1 = host)),
            switchMap(() => peer1.graphs[0].chains.log),
            filter(({item}) => item.code === 'NEW_PEER_CONNECTION'),
            tap(() => peer1Sub.unsubscribe()),
            delay(2000),
            tap(() => peer1Sub = startTestNode(1).subscribe(({host}) => peer1 = host)),
            switchMap(() => peer1.graphs[0].chains.log),
            filter(({item}) => item.code === 'NEW_PEER_CONNECTION'),
            tap(() => peer1Sub.unsubscribe()),
            tap(() => console.log('WAITING after second disconnect')),
            delay(2000),
            switchMap(() => startTestNode(1)),
            switchMap(({host}) => host.graphs[0].chains.log),
            filter(({item}) => item.code === 'NEW_PEER_CONNECTION'),
            delay(500)
        ))
    });

    it('should reject duplicate connections', () =>
        firstValueFrom(startTestNet([[1], [0]]).pipe(
            switchMap(({host0, host1}) => merge(
                host0.graphs[0].chains.log,
                host1.graphs[0].chains.log
            )),
            filter(({item}) => item.code === 'DUPLICATE_CONNECTION'),
            take(2)
        ))
    );
});