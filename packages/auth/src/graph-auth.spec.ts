import {combineLatest, firstValueFrom, switchMap, tap} from "rxjs";
import {graphAuth, graphNewAuth} from "./graph-auth.js";
import {getAGraph} from "@end-game/graph/testUtils";
import {expect} from 'chai'


describe('graph auth', () => {
    it('should return undefined if a user does not exist', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphAuth({graph, username: 'scott', password: 'pass'})),
            tap(({nodeId}) => expect(nodeId).to.equal(''))
        ))
    );

    it('should allow a user to signup for an account', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphNewAuth({graph, username: 'scott', password: 'pass'})),
            switchMap(({graph}) => graphAuth({graph, username: 'scott', password: 'pass'})),
            tap(({nodeId, auth}) => expect(auth).to.have.property('pubKey'))
        ))
    );

    it('should return empty nodeId and auth object if auth failed', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphNewAuth({graph, username: 'scott', password: 'pass'})),
            switchMap(({graph}) => combineLatest([
                graphAuth({graph, username: 'scott', password: 'wrong'}),
                graphAuth({graph, username: 'scott', password: 'pass'}),
            ])),
            tap(([badAuth, goodAuth]) => {
                expect(badAuth.nodeId).to.equal('');
                expect(badAuth.auth.pubKey).to.be.undefined;

                expect(goodAuth.nodeId).to.have.length(12);
                expect(goodAuth.auth.pubKey.type).to.equal('public')
            })
        ))
    )
});