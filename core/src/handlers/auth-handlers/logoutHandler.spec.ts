import {firstValueFrom, of, switchMap, tap} from "rxjs";
import {handlers} from "../handlers.js";
import {passwordAuthHandler} from "./passwordAuthHandler.js";
import {logoutHandler} from "./logoutHandler.js";
import {createUserHandler} from "./createUserHandler.js";
import {memoryStoreGetHandler, memoryStorePutHandler} from "../store-handlers/memoryStoreHandlers.js";
import {DeepPartial} from "tsdef";
import {EndgameConfig} from "../../app/endgameConfig.js";
import {AuthenticatedEndgame, endgameCreateUser, endgameLogout, newEndgame} from "../../app/endgame.js";
import {expect} from "chai";

describe('logout handler', () => {
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
            tap(({endgame}) => expect((endgame as AuthenticatedEndgame).keys).to.be.undefined)
        ))
    )
})
