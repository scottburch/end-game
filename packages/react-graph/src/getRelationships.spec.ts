import {combineLatest, firstValueFrom, switchMap, tap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe('getRelationships()', () => {
    it('should get relationships and update', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'getRelationships-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#node-0'),
                page.textContent('#node-1'),
                page.textContent('#node-2'),
            ])),
            tap(([s1, s2, s3]) => {
                expect(s1).to.equal('n1-other-0')
                expect(s2).to.equal('n1-other-1')
                expect(s3).to.equal('n1-other-2')
            })
        ))
    );
});