import {expect} from "chai";
import {newUid, timestampFromUid} from "./uid.js";
import {delay, firstValueFrom, map, of, tap} from "rxjs";

describe('uid utility', () => {
    it('should generate a uid', () =>
        firstValueFrom(of(newUid()).pipe(
            tap(uid => expect(uid).to.have.length(12))
        ))
    );

    it('should generate unique ids', () =>
        firstValueFrom(of([newUid(), newUid(), newUid()]).pipe(
            tap(uids => {
                expect(uids[0]).not.to.equal(uids[1]);
                expect(uids[1]).not.to.equal(uids[2]);
                expect(uids[2]).not.to.equal(uids[0]);
            })
        ))
    )

    it('should generate a uid with a timestamp embedded', () =>
        firstValueFrom(of(newUid()).pipe(
            map(uid => timestampFromUid(uid)),
            tap(date => expect(date.getTime()).to.be.closeTo(Date.now(), 1000))
        ))
    )
})