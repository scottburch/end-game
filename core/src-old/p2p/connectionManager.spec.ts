import {of, switchMap, tap} from "rxjs";
import {newConnectionManager, PeerConnection, uniqId} from "./connectionManager.js";
import {expect} from "chai";

describe('connection manager', () => {
    it('should respond true if a connection is a duplicate', (done) => {
        const cm = newConnectionManager();
        of(true).pipe(
            switchMap(() => cm.isDuplicateConnection('0-1', {id: 0} as PeerConnection)),
            tap(answer => expect(answer).to.be.false),
            switchMap(() => cm.isDuplicateConnection('0-2', {} as PeerConnection)),
            tap(answer => expect(answer).to.be.false),
            switchMap(() => cm.isDuplicateConnection('99-1', {id: 0} as PeerConnection)),
            tap(answer => expect(answer).to.be.false),
            switchMap(() => cm.isDuplicateConnection('99-1', {id: 1} as PeerConnection)),
            tap(answer => expect(answer).to.be.true)
        ).subscribe(() => done())
    });

    it('can generate a unique id', () => {
        expect(uniqId()).not.to.equal(uniqId()).not.to.equal(uniqId)
    });
});

