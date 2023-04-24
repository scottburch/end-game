import {combineLatest, delay, firstValueFrom, of, range, switchMap, tap} from "rxjs";
import {compileBrowserTestCode, newBrowser} from "../test/e2eTestUtils.ts";
import {expect} from "chai";

describe("nodesByLabel()", () => {
    it('should update reactively', () =>
        firstValueFrom(compileBrowserTestCode('react/nodesByLabel-test.tsx').pipe(
            switchMap(() => newBrowser()),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#node-0'),
                page.textContent('#node-1'),
                page.textContent('#node-2'),
            ])),
            tap(([s1, s2, s3]) => {
                expect(s1).to.equal('scott0')
                expect(s2).to.equal('scott1')
                expect(s3).to.equal('scott2')
            })
        ))
    )
});