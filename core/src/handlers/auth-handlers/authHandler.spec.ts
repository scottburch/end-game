import {firstValueFrom, of, switchMap, tap} from "rxjs";
import {endgameLogin, newEndgame} from "../../app/endgame.js";
import {EndgameConfig} from "../../app/endgameConfig.js";
import {passwordAuthHandler} from "./authHandler.js";
import {DeepPartial} from "tsdef";
import {handlers} from "../handlers.js";
import {expect} from "chai";

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
     )
});