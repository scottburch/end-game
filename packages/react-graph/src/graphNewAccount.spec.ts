import {delay, firstValueFrom, switchMap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe('graphNewAccount()', () => {
    it('should create a new account', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graphNewAccount-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.click('#create-account').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("scott")')),
        ))
    )
});