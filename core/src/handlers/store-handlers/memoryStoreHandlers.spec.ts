import {endgameLogin, endgameGet, endgameGetMeta, endgamePut, newEndgame} from "../../app/endgame.js";
import {testAuthHandler} from "../../test/testUtils.js";
import {memoryStoreGetHandler, memoryStoreGetMetaHandler, memoryStorePutHandler} from "./memoryStoreHandlers.js";
import {combineLatest, first, firstValueFrom, map, mergeMap, range, skip, switchMap, take, tap, toArray} from "rxjs";
import {expect} from "chai";
import {getNetworkTime} from "../../graph/endgameGraph.js";
import {handlers} from "../handlers.js";

describe('memory store handlers', () => {
    describe('get', () => {
        it('should return undefined if value does not exist', () =>
            firstValueFrom(newEndgame({
                handlers: {
                    get: handlers([memoryStoreGetHandler])
                }
            }).pipe(
                switchMap(endgame => endgameGet(endgame, 'my.path')),
                tap(({value}) => expect(value).to.be.undefined)
            ))
        );

        it('should get a value from the memory store', () =>
            firstValueFrom(newEndgame({
                handlers: {
                    login: handlers([testAuthHandler]),
                    get: handlers([memoryStoreGetHandler]),
                    put: handlers([memoryStorePutHandler]),
                    getMeta: handlers([memoryStoreGetMetaHandler])
                }
            }).pipe(
                switchMap(egame => endgameLogin(egame, 'username', 'password', 'my.user')),
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
        );

        it('should handle multiple values in parallel', () =>
            firstValueFrom(newEndgame({
                handlers: {
                    login: handlers([testAuthHandler]),
                    get: handlers([memoryStoreGetHandler]),
                    put: handlers([memoryStorePutHandler]),
                }
            }).pipe(
                switchMap(egame => endgameLogin(egame, 'username', 'password', 'my.user')),
                switchMap(({endgame}) => range(1, 5).pipe(
                    mergeMap(n => endgamePut(endgame, `my.path${n}`, n)),
                )),
                skip(4),
                switchMap(({endgame}) => range(1, 5).pipe(
                    mergeMap(n => endgameGet(endgame, `my.path${n}`).pipe(first())),
                )),
                take(5),
                map(({value}) => value),
                toArray(),
                tap(values => expect(values).to.deep.equal([1, 2, 3, 4, 5]))
            ))
        )

        it('should handle multiple pistol instances', () => {
            const config1 = {
                handlers: {
                    login: handlers([testAuthHandler]),
                    get: handlers([memoryStoreGetHandler]),
                    put: handlers([memoryStorePutHandler]),
                    getMeta: handlers([memoryStoreGetMetaHandler])
                }
            };

            const config2 = {
                port: 11111,
                handlers: {
                    login: handlers([testAuthHandler]),
                    get: handlers([memoryStoreGetHandler]),
                    put: handlers([memoryStorePutHandler]),
                    getMeta: handlers([memoryStoreGetMetaHandler])
                }
            };


            return firstValueFrom(combineLatest([
                newEndgame(config1).pipe(
                    tap(e => console.log(e.id)),
                    switchMap(egame => endgameLogin(egame, 'username', 'password', 'my.user')),
                    switchMap(({endgame}) => endgamePut(endgame, 'my.path', 1)),
                    switchMap(({endgame}) => endgameGet<number>(endgame, 'my.path')),
                ),
                newEndgame(config2).pipe(
                    tap(e => console.log(e.id)),
                    switchMap(egame => endgameLogin(egame, 'username', 'password', 'my.user')),
                    switchMap(({endgame}) => endgamePut(endgame, 'my.path', 2)),
                    switchMap(({endgame}) => endgameGet<number>(endgame, 'my.path')),
                )
            ]).pipe(
                tap(values => {
                    expect(values[0].value + values[1].value).to.equal(3)
                })
            ))
        })
    })
})