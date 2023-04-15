import {endgameAuth, endgameGet, endgamePut, newEndgame} from "../app/endgame.js";
import {newEndgameConfig} from "../app/endgameConfig.js";
import {testAuthHandler, testChains} from "../test/testUtils.js";
import {memoryStoreGetHandler, memoryStorePutHandler} from "./memoryStoreHandlers.js";
import {firstValueFrom, switchMap, tap} from "rxjs";
import {expect} from "chai";

describe('memory store handlers', () => {
    describe('get', () => {
        it('should get a value from the memory store', () =>
            firstValueFrom(newEndgame({
                config: newEndgameConfig({
                    chains: testChains({
                        auth: testAuthHandler(),
                        get: memoryStoreGetHandler(),
                        put: memoryStorePutHandler()
                    })
                })
            }).pipe(
                switchMap(egame => endgameAuth(egame, 'username', 'password', 'my.user')),
                switchMap(({endgame}) => endgamePut(endgame, 'my.path', 10)),
                switchMap(({endgame}) => endgameGet(endgame, 'my.path')),
                tap(({value}) => expect(value).to.equal(10))
            ))
        )
    })
})