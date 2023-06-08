import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {concatMap, firstValueFrom, last, mergeMap, of, range, switchMap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('nodesByProp()', () => {
    it('should update reactively', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'nodesByProp-test.tsx')).pipe(
            switchMap(() => openBrowser({url: 'http://127.0.0.1:1234'})),
            switchMap(page => of(page).pipe(
                switchMap(() => page.waitForSelector('div:text("scott")')),
                switchMap(() => range(0, 10).pipe(
                    concatMap(() => page.click('#count')),
                    last()
                )),
                switchMap(() => range(0, 10).pipe(
                    mergeMap(n => page.waitForSelector(`#node-${n}:text("scott${n}")`)),
                    last()
                ))
            ))
        ))
    )
});