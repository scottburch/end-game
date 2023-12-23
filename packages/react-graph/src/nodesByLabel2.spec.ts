import {combineLatest, firstValueFrom, switchMap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe('nodesByLabel() second tests', () => {
    it('should get a value from the graph', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'nodesByLabel2-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#node-0:text("0:0:person-0")'),
                page.textContent('#node-1:text("1:1:person-1")'),
                page.textContent('#node-2:text("2:2:person-2")'),
            ]))
        ))
    )
})