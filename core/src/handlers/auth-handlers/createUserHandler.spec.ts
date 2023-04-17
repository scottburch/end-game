import {filter, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {handlers} from "../handlers.js";
import {DeepPartial} from "tsdef";
import {EndgameConfig} from "../../app/endgameConfig.js";
import {endgameCreateUser, endgameGet, newEndgame} from "../../app/endgame.js";
import {expect} from "chai";
import {createUserHandler} from "./createUserHandler.js";
import {memoryStoreGetHandler, memoryStorePutHandler} from "../store-handlers/memoryStoreHandlers.js";

describe('createUserHandler()', () => {
    it('should create a user object in the store', () =>
        firstValueFrom(of({
            handlers: {
                createUser: handlers([createUserHandler]),
                put: handlers([memoryStorePutHandler]),
                get: handlers([memoryStoreGetHandler])
            }
        } as DeepPartial<EndgameConfig>).pipe(
            switchMap(newEndgame),
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