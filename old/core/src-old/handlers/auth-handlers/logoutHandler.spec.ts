import {firstValueFrom, of, switchMap, tap} from "rxjs";
import {handlers} from "../handlers";
import {passwordAuthHandler} from "./passwordAuthHandler";
import {logoutHandler} from "./logoutHandler";
import {createUserHandler} from "./createUserHandler";
import {memoryStoreGetHandler, memoryStorePutHandler} from "../store-handlers/memoryStoreHandlers";
import {DeepPartial} from "tsdef";
import {EndgameConfig} from "../../app/endgameConfig";
import {AuthenticatedEndgame, endgameCreateUser, endgameLogout, newEndgame} from "../../app/endgame";
import {expect} from "chai";
import {testLocalEndgame} from "../../test/testUtils";

describe('logout handler', () => {
    it('should allow me to login after a failed login', () =>
        firstValueFrom(testLocalEndgame().pipe(
            switchMap(endgame => endgameCreateUser(endgame, 'username', 'password', 'my.user')),
            switchMap(({endgame}) => endgameLogout(endgame)),
            tap(({endgame}) => expect((endgame as AuthenticatedEndgame).keys).to.be.undefined)
        ))
    )
})
