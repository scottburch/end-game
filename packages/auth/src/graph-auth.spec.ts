import {firstValueFrom, switchMap, tap} from "rxjs";
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
            tap(({nodeId, auth}) => expect(auth).to.have.property('pub'))
        ))
    );
});