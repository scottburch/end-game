import {delay, firstValueFrom, switchMap} from "rxjs";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('graph-explorer', () => {
    it('should open a graph explorer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.click('button:text("Graph Explorer")')),
            delay(100000000)
        ))
    )
});