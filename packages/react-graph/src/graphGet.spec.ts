import {combineLatest, firstValueFrom, switchMap, tap} from "rxjs";
import {expect} from "chai";
import {openBrowser} from "@end-game/utils/openBrowser";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe('graphGet()', () => {
    it('should get a value from the graph', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graphGet-test.tsx')).pipe(
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
            tap(([n1, n2, n3]) => {
                expect(n1).to.equal('0:0:person-0');
                expect(n2).to.equal('1:1:person-1');
                expect(n3).to.equal('2:2:person-2');
            })
        ))
    )
})