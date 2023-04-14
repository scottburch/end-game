import {firstValueFrom, switchMap, tap} from "rxjs";
import {testLocalAuthedEndgame} from "../test/testUtils";
import {endgameRuleGet, endgameRulePut} from "./endgame";
import {expect} from "chai";

describe('rules', () => {
    it("should be able to write a rule", () =>
        firstValueFrom(testLocalAuthedEndgame().pipe(
            switchMap(endgame => endgameRulePut(endgame, 'reader', 'writer', 'my.rule')),
            switchMap(({endgame}) => endgameRuleGet(endgame, 'my.rule')),
            tap(({rule}) => {
                expect(rule?.ownerPath).to.equal('my.user');
                expect(rule?.reader).to.equal('reader');
                expect(rule?.writer).to.equal('writer');
                expect(rule?.sig).to.have.length(128)
            })
        ))
    );
});