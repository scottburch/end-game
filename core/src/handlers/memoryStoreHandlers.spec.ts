import {endgameAuth, endgameGet, endgameGetMeta, endgamePut, newEndgame} from "../app/endgame.js";
import {newEndgameConfig} from "../app/endgameConfig.js";
import {testAuthHandler, testChains} from "../test/testUtils.js";
import {memoryStoreGetHandler, memoryStoreGetMetaHandler, memoryStorePutHandler} from "./memoryStoreHandlers.js";
import {firstValueFrom, switchMap, tap} from "rxjs";
import {expect} from "chai";
import {getNetworkTime} from "../graph/endgameGraph.js";

describe('memory store handlers', () => {
    describe('get', () => {
        it('should get a value from the memory store', () =>
            firstValueFrom(newEndgame({
                config: newEndgameConfig({
                    chains: testChains({
                        auth: testAuthHandler(),
                        get: memoryStoreGetHandler(),
                        put: memoryStorePutHandler(),
                        getMeta: memoryStoreGetMetaHandler()
                    })
                })
            }).pipe(
                switchMap(egame => endgameAuth(egame, 'username', 'password', 'my.user')),
                switchMap(({endgame}) => endgamePut(endgame, 'my.path', 10)),
                switchMap(({endgame}) => endgameGet(endgame, 'my.path')),
                tap(({value}) => expect(value).to.equal(10)),
                switchMap(({endgame}) => endgameGetMeta(endgame, 'my.path')),
                tap(({meta}) => {
                    expect(meta?.owner).to.have.length(176);
                    expect(meta?.sig).to.have.length(128);
                    expect(meta?.perms).to.equal(484);
                    expect(meta?.timestamp).to.be.closeTo(getNetworkTime(), 1000)
                })
            ))
        )
    })
})