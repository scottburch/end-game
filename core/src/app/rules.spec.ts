import {firstValueFrom, switchMap} from "rxjs";
import {testLocalAuthedEndgame} from "../test/testUtils.js";
import {endgameRulePut} from "./endgame.js";

describe('rules', () => {
    it("should be able to write a rule", () =>
        firstValueFrom(testLocalAuthedEndgame().pipe(
            switchMap(endgame => endgameRulePut(endgame, 'reader', 'writer'))
        ))
    );
});