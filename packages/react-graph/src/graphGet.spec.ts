import {combineLatest,  firstValueFrom, of, switchMap, tap} from "rxjs";
import {expect} from "chai";
import {compileBrowserTestCode} from "./test/e2eTestUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";



describe('graphGet()', () => {
    it('should get a value from the graph', () =>
        firstValueFrom(compileBrowserTestCode('./graphGet-test.tsx').pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#node-id'),
                page.textContent('#node-count'),
                of(page)
            ])),
            tap(([id, count]) => {
                expect(id).to.equal('1');
                expect(count).to.equal('1')
            }),
            switchMap(([_1, _2, page])=> page.click('#count').then(() => page)),
            switchMap(page => page.textContent('#node-count')),
            tap(count => expect(count).to.equal('2')),
        ))
    )
})