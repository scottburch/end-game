import {combineLatest, firstValueFrom, switchMap} from "rxjs";
import {absPath} from "@end-game/utils/absPath";
import {openBrowser} from "@end-game/utils/openBrowser";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";

describe('memory graph', () => {

    it('should not require an auth', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'memGraph-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#node-0:text("0:0:person-0")'),
                page.textContent('#node-1:text("1:1:person-1")'),
                page.textContent('#node-2:text("2:2:person-2")'),
            ]))
        ))
    );
});