import {firstValueFrom} from "rxjs";
import {newEndgame} from "../../app/endgame.js";

describe('auth handlers', () => {
     it('should login', () =>
        firstValueFrom(newEndgame({}))
     )
});