import {firstValueFrom, switchMap, tap} from "rxjs";
import {compileBrowserTestCode, newBrowser} from "../test/e2eTestUtils.ts";
import {expect} from "chai";

describe('react graph', () => {
    describe('context component', () => {
        it('should allow you to set the graph', () =>
            firstValueFrom(compileBrowserTestCode('react/reactGraph-test.tsx').pipe(
                switchMap(() => newBrowser()),
                switchMap(page => page.textContent('#graph-id')),
                tap(text => expect(text).to.equal('my-graph'))
            ))


        )
    })
})