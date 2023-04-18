import {combineLatest, delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {
    AuthenticatedEndgame,
    Endgame,
    endgameCreateUser,
    endgameLogin,
    endgameLogout,
    newEndgame
} from "../../app/endgame.js";
import {EndgameConfig} from "../../app/endgameConfig.js";
import {passwordAuthHandler} from "./passwordAuthHandler.js";
import {DeepPartial} from "tsdef";
import {handlers} from "../handlers.js";
import {expect} from "chai";
import {createUserHandler} from "./createUserHandler.js";
import {memoryStoreGetHandler, memoryStorePutHandler} from "../store-handlers/memoryStoreHandlers.js";
import {serializePubKey} from "../../crypto/crypto.js";
import {logoutHandler} from "./logoutHandler.js";

describe('auth handlers', () => {
     it('should return a regular endgame object if user does not exist', () =>
        firstValueFrom(of({
             handlers: {
                  login: handlers([passwordAuthHandler])
             }
        } as DeepPartial<EndgameConfig>).pipe(
            switchMap(newEndgame),
            switchMap(endgame => endgameLogin(endgame, 'username', 'password', 'my.user')),
            tap(({endgame}) => expect((endgame as AuthenticatedEndgame).keys).to.be.undefined)
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
                    serializePubKey((endgame as AuthenticatedEndgame).keys.pubKey),
                    serializePubKey(props1.endgame.keys.pubKey)
                ]))
            )),
            tap(([loginKey, createKey]) => expect(createKey).to.equal(loginKey))
        ))
     );

     it('should allow me to login after a failed login', () =>
         firstValueFrom(of({
             handlers: {
                 login: handlers([passwordAuthHandler]),
                 logout: handlers([logoutHandler]),
                 createUser: handlers([createUserHandler]),
                 put: handlers([memoryStorePutHandler]),
                 get: handlers([memoryStoreGetHandler])
             }
         } as DeepPartial<EndgameConfig>).pipe(
             switchMap(newEndgame),
             switchMap(endgame => endgameCreateUser(endgame, 'username', 'password', 'my.user')),
             switchMap(({endgame}) => endgameLogout(endgame)),
             tap(({endgame}) => expect((endgame as AuthenticatedEndgame).keys).to.be.undefined),
             switchMap(({endgame}) => endgameLogin(endgame, 'username', 'password', 'fake.user')),
             tap(({endgame}) => expect((endgame as AuthenticatedEndgame).keys).to.be.undefined),
             switchMap(({endgame}) => endgameLogin(endgame, 'username', 'password', 'my.user')),
             tap(({endgame}) => {
                 expect((endgame as AuthenticatedEndgame).keys).not.to.be.undefined;
                 expect((endgame as AuthenticatedEndgame).userPath).to.equal('my.user');
                 expect((endgame as AuthenticatedEndgame).username).to.equal('username');
             })
         ))
     )
});