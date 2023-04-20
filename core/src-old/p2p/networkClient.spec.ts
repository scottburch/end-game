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
    AuthenticatedEndgame, Endgame,
    endgameLogin, endgameGet, endgamePut
} from "../app/endgame.js";

import {PeerMsg} from "./peerMsg.js";
import {expect} from "chai";
import {generateNewAccount} from "../crypto/crypto.js";


describe.skip('network client', function () {
    this.timeout(20_000);

    it('should send a message that is updated to the same value as before', () => {
        return firstValueFrom(startTestNetwork([[1], []]).pipe(
            switchMap(endgames => merge(
                (
                    of(endgames[0]).pipe(
                        switchMap(endgame => generateNewAccount().pipe(map(keys => ({endgame, keys})))),
                        switchMap(({endgame, keys}) => endgameLogin(endgame, 'username', 'password', 'my.user')),
                        switchMap(({endgame}) => endgamePut(endgame as AuthenticatedEndgame, 'my.path', 1)),
                        delay(20),
                        switchMap(({endgame}) => endgamePut(endgame, 'my.path', 2)),
                        delay(20),
                        switchMap(({endgame}) => endgamePut(endgame, 'my.path', 1)),
                        delay(20),
                        switchMap(({endgame}) => endgamePut(endgame, 'my.path', 2)),
                        delay(20),
                        switchMap(({endgame}) => endgamePut(endgame, 'my.path', 1)),
                        delay(20),
                        switchMap(({endgame}) => endgamePut(endgame, 'my.path', 2)),
                        delay(100)
                    )
                ),
                (
                    of(endgames[1]).pipe(
                        switchMap(endgame => endgameGet(endgame, 'my.path')),
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
            tap(endgames => setTimeout(() => endgames[0].config.handlers.peersOut.next({endgame: endgames[0], msg: peerMsg}))),
            tap(endgames => setTimeout(() => endgames[0].config.handlers.peersOut.next({endgame: endgames[0], msg: peerMsg}))),
            switchMap(endgames => endgames[0].config.handlers.peerIn),
            filter(({msg}) => msg.cmd !== 'announce'),
            takeUntil(timer(2000)),
            count(),
            tap(count => expect(count).to.equal(1))
        ).subscribe(() => done())
    });

    it('should reject duplicate connections to/from the same node', () =>
        firstValueFrom(startTestNetwork([[1], []]).pipe(
            switchMap(endgames => of(endgames).pipe(
                tap(() => firstValueFrom(timer(1000).pipe(
                    switchMap(() => dialPeer(endgames[1], 'ws://localhost:11110')),
                    delay(5000)
                ))),
                switchMap(() => merge(
                    endgames[0].config.handlers.log,
                    endgames[1].config.handlers.log,
                )),
                filter((entry) =>
                    entry.code === 'DUPLICATE_CONNECTION'
                ),
                tap(() =>
                    firstValueFrom(timer(100).pipe(
                        switchMap(() => endgamePut(endgames[0] as AuthenticatedEndgame, 'foo.bar', 10))
                    ))
                ),
                scan(c => c + 1, 0),
                tap(c => expect(c).to.equal(1)),
                switchMap(() => endgames[0].config.handlers.peerIn),
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
            tap(endgame => sub = dialPeer(endgame, 'ws://localhost:11111', {redialInterval: 1}).subscribe()),
            switchMap(endgame => endgame.config.handlers.log),
            filter((entry) => entry.data?.text.includes('ECONNREFUSED')),
            bufferCount(3),
            switchMap(() => startTestNode(1, [])),
            switchMap(endgame => endgame.config.handlers.peerConnect),
            first(),
            tap(() => sub.unsubscribe())
        ).subscribe(() => done())
    });

    it('should redial if a connection is lost', (done) => {
        let node1: Endgame;
        let node0: AuthenticatedEndgame;

        // start node 1
        let node1Sub = startTestNode(1).subscribe(endgame => node1 = endgame);

        // start node 0
        startTestNode(0, [1]).pipe(
            switchMap(endgame => generateNewAccount().pipe(map(keys => ({endgame: endgame, keys})))),
            switchMap(({keys, endgame}) => endgameLogin(endgame, 'username', 'password', 'my.user')),
            tap(({endgame}) => node0 = (endgame as AuthenticatedEndgame)),

            // Write a value to node 0 and read it on node 1
            switchMap(() => endgamePut(node0, 'my.thing', 10)),
            switchMap(() => endgameGet(node1, 'my.thing')),
            filter(({value}) => value === 10),

            // stop node 1
            tap(() => node1Sub.unsubscribe()),
            delay(1000),

            // start a new node 1
            switchMap(() => startTestNode(1)),

            // read the value on the new node 1 proving that node0 connected
            switchMap(endgame => endgameGet(endgame, 'my.thing')),
            filter(({value}) => value === 10),

            take(1)
        ).subscribe(() => done());
    });

    it('should handle a bunch of updates in trusted mode', () => {
        const count = 50;

        return firstValueFrom(startTestNetwork([[1], []]).pipe(
            switchMap(endgames => merge(
                (
                    of(endgames[0]).pipe(
                        switchMap(endgame => generateNewAccount().pipe(map(keys => ({endgame: endgame, keys})))),
                        switchMap(({endgame, keys}) => endgameLogin(endgame, 'username', 'password', 'my.user')),
                        switchMap(({endgame}) => range(1, count).pipe(map(n => ({endgame: endgame, n})))),
                        concatMap(({n, endgame}) => endgamePut(endgame as AuthenticatedEndgame, 'my.path', n % (count / 2)).pipe(delay(10))),
                        bufferCount(count)
                    )
                ), (
                    of(endgames[1]).pipe(
                        switchMap(endgame => endgameGet(endgame, 'my.path')),
                        map(({value}) => value),
                        bufferCount(count)
                    )
                )
            )),
            take(2)
        ));
    });
});