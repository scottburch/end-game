import {firstValueFrom, switchMap, tap} from "rxjs";
import {compileBrowserTestCode} from "./test/e2eTestUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";

describe('react graph', () => {
    describe('context component', () => {
        it('should allow you to set the graph', () =>
            firstValueFrom(compileBrowserTestCode('./reactGraph-test.tsx').pipe(
                switchMap(() => openBrowser()),
                switchMap(page => page.textContent('#graph-id')),
                tap(text => expect(text).to.equal('my-graph'))
            ))
        );
    });
});