import {firstValueFrom, map, switchMap, tap} from "rxjs";
import {endgameCreateUser, endgameGet, newEndgame} from "../../app/endgame";
import {expect} from "chai";
import {testLocalEndgame} from "../../test/testUtils";

describe('createUserHandler()', () => {
    it('should create a user object in the store', () =>
        firstValueFrom(testLocalEndgame().pipe(
            switchMap(endgame => endgameCreateUser(endgame, 'my-username', 'password', 'my.user')),
            switchMap(({endgame}) => endgameGet<string>(endgame, 'my.user')),
            map(({value}) => JSON.parse(value)),
            tap(({username, keys}) => {
                expect(username).to.equal('my-username');
                expect(keys.pub).not.to.be.undefined;
                expect(keys.priv).not.to.be.undefined;
            }),
        ))
    )
});