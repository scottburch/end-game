import {count, delay, filter, first, map, switchMap, takeUntil, tap, timer} from "rxjs";
import {startTestNetwork} from "../test/testUtils.js";
import {Endgame} from "../app/endgame.js";
import {newPeerMsg, PeerMsg} from "./peerMsg.js";
import {expect} from "chai";



describe.skip('p2p network', function()  {
    this.timeout(10_000);

    it('should not send the same message more than once on a connection', (done) => {
        const peerMsg = {
            from: 'zero',
            cmd: 'testing',
            payload: {},
            forward: true
        } satisfies PeerMsg<'testing', {}>;
        startTestNetwork([[1], []]).pipe(
            tap(pistols => setTimeout(() => pistols[1].config.handlers.peersOut.next({endgame: pistols[1], msg: peerMsg}) )),
            tap(pistols => setTimeout(() => pistols[1].config.handlers.peersOut.next({endgame: pistols[1], msg: peerMsg}))),
            switchMap(pistols => pistols[0].config.handlers.peerIn),
            filter(({msg}) => msg.cmd === 'testing'),
            takeUntil(timer(2000)),
            count(),
            tap(count => expect(count).to.equal(1))
        ).subscribe(() => done())
    });

    it('should setup a network of nodes', (done) => {
        startTestNetwork([[1,2], [2], [0,1]]).pipe(
            switchMap(pistols => sendAndTestMsg('0-1', pistols[0], pistols[1], pistols)),
            switchMap(pistols => sendAndTestMsg('1-0', pistols[1], pistols[0], pistols)),
            switchMap(pistols => sendAndTestMsg('0-2', pistols[0], pistols[2], pistols)),
            switchMap(pistols => sendAndTestMsg('2-0', pistols[2], pistols[0], pistols)),
            switchMap(pistols => sendAndTestMsg('1-2', pistols[1], pistols[2], pistols)),
            switchMap(pistols => sendAndTestMsg('2-1', pistols[2], pistols[1], pistols)),
            first()
        ).subscribe(() => done());
    });

    it('should forward messages down a peer handlers', (done) => {
        startTestNetwork([[1], [2], [3], []]).pipe(
            switchMap(pistols => sendAndTestMsg('my-message', pistols[0], pistols[3], pistols)),
            first()
        ).subscribe(() => done())
    });
});

const sendAndTestMsg = (cmd: string, outPistol: Endgame, inPistol: Endgame, pistols: Endgame[]) => {
    setTimeout(() => {
        outPistol.config.handlers.peersOut.next({endgame: outPistol, msg: newPeerMsg(outPistol, {cmd: cmd, payload: '', forward: true})})
    });

    return inPistol.config.handlers.peerIn.pipe(
        filter(({msg}) => msg.cmd === cmd),
        map(() => pistols),
        delay(1),
        first(),
    )
}