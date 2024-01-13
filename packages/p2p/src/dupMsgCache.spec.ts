import {isDupMsg, newDupMsgCache} from "./dupMsgCache.js";
import {expect} from "chai";
import {firstValueFrom, of, tap} from "rxjs";
import {asGraphId} from "@end-game/graph";

describe('dup message cache', () => {
    it('should allow you to create a new message cache with a default timeout', (done) => {
        expect(newDupMsgCache().timeout).to.equal(5000);
        done();
    });

    it('should be able to check if something is a duplicate', () =>
        firstValueFrom(of(newDupMsgCache()).pipe(
            tap(cache => isDupMsg(cache, {graphId: asGraphId('graph'), msg: {cmd: 'cmd', data: 'testing'}})),
            tap(cache =>
                expect(isDupMsg(cache, {graphId: asGraphId('graph'), msg: {cmd: 'cmd', data: 'something'}})).to.be.false
            ),
            tap(cache =>
                expect(isDupMsg(cache, {graphId: asGraphId('graph'), msg: {cmd: 'cmd', data: 'testing'}})).to.be.true
            )
        ))
    );
});
