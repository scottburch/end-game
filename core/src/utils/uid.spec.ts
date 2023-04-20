import {expect} from "chai";
import {newUid, timestampFromUid} from "./uid.js";
import {delay, firstValueFrom, map, of, tap} from "rxjs";

describe('uid utility', () => {
    it('should generate a uid', () =>
        firstValueFrom(of(newUid()).pipe(
            tap(uid => expect(uid).to.have.length(12))
        ))
    );

    it('should generate a uid with a timestamp embedded', () =>
        firstValueFrom(of(newUid()).pipe(
            map(uid => timestampFromUid(uid)),
            tap(date => expect(date.getTime()).to.be.closeTo(Date.now(), 1000))
        ))
    )
})