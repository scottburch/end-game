import {startTestNetwork, startTestNode} from "../test/testUtils.js";
import {
    bufferCount, concatMap,
    count,
    delay,
    filter,
    first,
    firstValueFrom,
    map,
    merge,
    of, range,
    scan,
    Subscription,
    switchMap,
    take,
    takeUntil,
    tap,
    timer,
} from "rxjs";
import {dialPeer} from "./networkClient.js";
import {
    AuthenticatedPistol, Pistol,
    pistolAuth, pistolGet, pistolPut
} from "../app/pistol.js";

import {PeerMsg} from "./peerMsg.js";
import {expect} from "chai";
import {generateNewAccount} from "../crypto/crypto.js";


describe.skip('network client', function () {
    this.timeout(20_000);

    it('should send a message that is updated to the same value as before', () => {
        return firstValueFrom(startTestNetwork([[1], []]).pipe(
            switchMap(pistols => merge(
                (
                    of(pistols[0]).pipe(
                        switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
                        switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', 'password', 'my.user')),
                        switchMap(({pistol}) => pistolPut(pistol, 'my.path', 1)),
                        delay(20),
                        switchMap(({pistol}) => pistolPut(pistol, 'my.path', 2)),
                        delay(20),
                        switchMap(({pistol}) => pistolPut(pistol, 'my.path', 1)),
                        delay(20),
                        switchMap(({pistol}) => pistolPut(pistol, 'my.path', 2)),
                        delay(20),
                        switchMap(({pistol}) => pistolPut(pistol, 'my.path', 1)),
                        delay(20),
                        switchMap(({pistol}) => pistolPut(pistol, 'my.path', 2)),
                        delay(100)
                    )
                ),
                (
                    of(pistols[1]).pipe(
                        switchMap(pistol => pistolGet(pistol, 'my.path')),
                        map(({value}) => value as number),
                        filter(value => value === 2),
                        bufferCount(3),
                    )
                )
            )),
            take(2),
        ));
    });

    it('should not send the same message more than once on a connection', (done) => {
        const peerMsg = {
            from: 'zero',
            cmd: 'testing',
            payload: {},
            forward: true
        } satisfies PeerMsg<'testing', {}>;
        startTestNetwork([[1], []]).pipe(
            tap(pistols => setTimeout(() => pistols[0].config.chains.peersOut.next({pistol: pistols[0], msg: peerMsg}))),
            tap(pistols => setTimeout(() => pistols[0].config.chains.peersOut.next({pistol: pistols[0], msg: peerMsg}))),
            switchMap(pistols => pistols[0].config.chains.peerIn),
            filter(({msg}) => msg.cmd !== 'announce'),
            takeUntil(timer(2000)),
            count(),
            tap(count => expect(count).to.equal(1))
        ).subscribe(() => done())
    });

    it('should reject duplicate connections to/from the same node', () =>
        firstValueFrom(startTestNetwork([[1], []]).pipe(
            switchMap(pistols => of(pistols).pipe(
                tap(() => firstValueFrom(timer(1000).pipe(
                    switchMap(() => dialPeer(pistols[1], 'ws://localhost:11110')),
                    delay(5000)
                ))),
                switchMap(() => merge(
                    pistols[0].config.chains.log,
                    pistols[1].config.chains.log,
                )),
                filter((entry) =>
                    entry.code === 'DUPLICATE_CONNECTION'
                ),
                tap(() =>
                    firstValueFrom(timer(100).pipe(
                        switchMap(() => pistolPut(pistols[0], 'foo.bar', 10))
                    ))
                ),
                scan(c => c + 1, 0),
                tap(c => expect(c).to.equal(1)),
                switchMap(() => pistols[0].config.chains.peerIn),
                filter(({msg}) => msg.cmd === 'put'),
                takeUntil(timer(4000)),
                count(),
                tap(c => expect(c).to.equal(2))
            ))
        ))
    );


    it.skip('should redial until it gets a connection', (done) => {
        let sub: Subscription;
        startTestNode(0, []).pipe(
            tap(pistol => sub = dialPeer(pistol, 'ws://localhost:11111', {redialInterval: 1}).subscribe()),
            switchMap(pistol => pistol.config.chains.log),
            filter((entry) => entry.data?.text.includes('ECONNREFUSED')),
            bufferCount(3),
            switchMap(() => startTestNode(1, [])),
            switchMap(pistol => pistol.config.chains.peerConnect),
            first(),
            tap(() => sub.unsubscribe())
        ).subscribe(() => done())
    });

    it('should redial if a connection is lost', (done) => {
        let node1: Pistol;
        let node0: AuthenticatedPistol;

        // start node 1
        let node1Sub = startTestNode(1).subscribe(pistol => node1 = pistol);

        // start node 0
        startTestNode(0, [1]).pipe(
            switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
            switchMap(({keys, pistol}) => pistolAuth(pistol, 'username', 'password', 'my.user')),
            tap(({pistol}) => node0 = pistol),

            // Write a value to node 0 and read it on node 1
            switchMap(() => pistolPut(node0, 'my.thing', 10)),
            switchMap(() => pistolGet(node1, 'my.thing')),
            filter(({value}) => value === 10),

            // stop node 1
            tap(() => node1Sub.unsubscribe()),
            delay(1000),

            // start a new node 1
            switchMap(() => startTestNode(1)),

            // read the value on the new node 1 proving that node0 connected
            switchMap(pistol => pistolGet(pistol, 'my.thing')),
            filter(({value}) => value === 10),

            take(1)
        ).subscribe(() => done());
    });

    it('should handle a bunch of updates in trusted mode', () => {
        const count = 50;

        return firstValueFrom(startTestNetwork([[1], []]).pipe(
            switchMap(pistols => merge(
                (
                    of(pistols[0]).pipe(
                        switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
                        switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', 'password', 'my.user')),
                        switchMap(({pistol}) => range(1, count).pipe(map(n => ({pistol, n})))),
                        concatMap(({n, pistol}) => pistolPut(pistol, 'my.path', n % (count / 2)).pipe(delay(10))),
                        bufferCount(count)
                    )
                ), (
                    of(pistols[1]).pipe(
                        switchMap(pistol => pistolGet(pistol, 'my.path')),
                        map(({value}) => value),
                        bufferCount(count)
                    )
                )
            )),
            take(2)
        ));
    });
});