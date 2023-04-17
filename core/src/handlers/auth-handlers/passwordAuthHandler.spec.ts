import {combineLatest, firstValueFrom, map, merge, of, switchMap, tap} from "rxjs";
import {Endgame, endgameCreateUser, endgameLogin, newEndgame} from "../../app/endgame.js";
import {EndgameConfig} from "../../app/endgameConfig.js";
import {passwordAuthHandler} from "./passwordAuthHandler.js";
import {DeepPartial} from "tsdef";
import {handlers} from "../handlers.js";
import {expect} from "chai";
import {createUserHandler} from "./createUserHandler.js";
import {memoryStoreGetHandler, memoryStorePutHandler} from "../store-handlers/memoryStoreHandlers.js";
import {serializeKeys, serializePubKey} from "../../crypto/crypto.js";

describe('auth handlers', () => {
     it('should return a regular endgame object if user does not exist', () =>
        firstValueFrom(of({
             handlers: {
                  login: handlers([passwordAuthHandler])
             }
        } as DeepPartial<EndgameConfig>).pipe(
            switchMap(newEndgame),
            switchMap(endgame => endgameLogin(endgame, 'username', 'password', 'my.user')),
            tap(({endgame}) => expect(endgame.keys).to.be.undefined)
        ))
     );

     it('should return an authenticated endgame object if the user does exist', () =>
        firstValueFrom(of({
            handlers: {
                login: handlers([passwordAuthHandler]),
                createUser: handlers([createUserHandler]),
                put: handlers([memoryStorePutHandler]),
                get: handlers([memoryStoreGetHandler])
            }
        } as DeepPartial<EndgameConfig>).pipe(
            switchMap(newEndgame),
            switchMap(endgame => endgameCreateUser(endgame, 'username', 'password', 'my.user')),
            map(props1 => ({props1, endgame: {id: props1.endgame.id, config: props1.endgame.config} as Endgame})),
            switchMap(({props1, endgame}) => endgameLogin(endgame, 'username', 'password', 'my.user').pipe(
                switchMap(({endgame}) => combineLatest([
                    serializePubKey(endgame.keys.pubKey),
                    serializePubKey(props1.endgame.keys.pubKey)
                ]))
            )),
            tap(keys => expect(keys[0]).to.equal(keys[1]))
        ))
     )
});