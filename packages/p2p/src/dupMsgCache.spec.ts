import {isDupMsg, newDupMsgCache} from "./dupMsgCache.js";
import {expect} from "chai";
import {firstValueFrom, of, tap} from "rxjs";

describe('dup message cache', () => {
    it('should allow you to create a new message cache with a default timeout', (done) => {
        expect(newDupMsgCache().timeout).to.equal(5000);
        done();
    });

    it('should be able to check if something is a duplicate', () =>
        firstValueFrom(of(newDupMsgCache()).pipe(
            tap(cache => isDupMsg(cache, 'testing')),
            tap(cache =>
                expect(isDupMsg(cache, 'something')).to.be.false
            ),
            tap(cache =>
                expect(isDupMsg(cache, 'testing')).to.be.true
            )
        ))
    );

});
