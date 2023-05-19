import {combineLatest, firstValueFrom, switchMap, tap} from "rxjs";

import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe("nodesByLabel()", () => {
    it('should update reactively', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'nodesByLabel-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#thing4'),
                page.textContent('#thing5'),
                page.textContent('#thing6'),
            ])),
            tap(([s1, s2, s3]) => {
                expect(s1).to.equal('thing4')
                expect(s2).to.equal('thing5')
                expect(s3).to.equal('thing6')
            })
        ))
    )
});