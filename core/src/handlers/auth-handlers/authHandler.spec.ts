import {firstValueFrom, of, switchMap} from "rxjs";
import {newEndgame} from "../../app/endgame.js";
import {EndgameConfig} from "../../app/endgameConfig.js";
import {passwordAuthHandler} from "./authHandler.js";
import {DeepPartial} from "tsdef";

describe('auth handlers', () => {
     it('should login', () =>
        firstValueFrom(of({
             handlers: {
                  auth: [passwordAuthHandler]
             }
        } as DeepPartial<EndgameConfig>).pipe(
            switchMap(newEndgame)
        ))
     )
});