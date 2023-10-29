import {delay, firstValueFrom, switchMap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe('graphGet()', () => {
    it('should get a value from the graph and update', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graphGet-withUpdate-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.click('#attachListener').then(() => page)),
            switchMap(page => page.click('#update').then(() => page)),
            delay(100),
            switchMap(page => page.click('#update').then(() => page)),
            delay(100),
            switchMap(page => page.click('#update').then(() => page)),
            delay(100),
            switchMap(page => page.textContent('#output:text(",1,2,3")'))
        ))
    )
})