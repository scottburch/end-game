import {startTestNetwork} from "../test/testUtils.js";
import {count, delay, filter, map, mergeMap, range, scan, switchMap, takeUntil, tap, timer} from "rxjs";
import {expect} from "chai";
import {endgamePut} from "../app/endgame.js";


describe.skip('p2p performance', function () {
    this.timeout(30_000);

    it('should be performant on messages with a 4 node mesh network - this is not!!!', function (done) {
        let start: number;
        let totalTime: number;
        const iterations = 10;
        const peers = [[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]];
        const expectedMsgCount = peers.length * iterations * Math.pow(peers.length - 1, 2) // 9 = total peer links

        startTestNetwork(peers).pipe(
            delay(100),
            tap(() => start = Date.now()),
            switchMap(endgames => range(0, peers.length).pipe(
                    mergeMap((nodeNum) => range(1, iterations).pipe(
                        tap(n => endgamePut(endgames[nodeNum], `node${nodeNum}.foo-${n}`, 'xx').subscribe())
                    )),
                    map(() => endgames)
                )
            ),
            switchMap(endgames =>
                endgames[0].config.handlers.peerIn.pipe(
                    map(({msg, endgame}) => ({nodeId: endgame.id, msg}))),
            ),
            filter(({msg, nodeId}) => nodeId !== msg.from),
            filter(({msg}) => msg.cmd === 'put'),

            scan((count) => count > expectedMsgCount ? throwIt(`too many messages: ${count}`) : count + 1, 0),
            tap(() => totalTime = Date.now() - start),
            takeUntil(timer(2_000)),
            count(),
            tap(count => console.log('Number of messages: ', count)),
            tap(() => console.log('Total time', `${totalTime}ms`)),
            tap(count => expect(count).to.equal(expectedMsgCount))
        ).subscribe(() => done());

        const throwIt = (text: string) => {
            throw(text)
        }
    });

    // it('should be performant end-to-end with 4 nodes', () => {
    //     let start: number;
    //     const iterations = 10;
    //     const peers = [[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]];
    //
    //     return firstValueFrom(startTestNetwork(peers).pipe(
    //         delay(100),
    //         tap(() => start = Date.now()),
    //         tap(endgames => range(0, peers.length).pipe(
    //                 mergeMap((nodeNum) => range(1, iterations).pipe(
    //                     mergeMap(n => endgamePut(endgames[nodeNum], `base.${nodeNum}-${n}`, 'xx'))
    //                 )),
    //                 map(() => endgames)
    //             ).subscribe()
    //         ),
    //         switchMap(endgames => endgameKeys(endgames[0], 'base')),
    //         takeWhile(({keys}) => keys.length < 40),
    //         last(),
    //         map(() => Date.now() - start),
    //         tap(t => console.log('time:', t))
    //     ));
    // });
});
