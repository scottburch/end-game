import {delay, firstValueFrom, map, switchMap, tap} from "rxjs";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {openBrowser} from "@end-game/utils/openBrowser";


describe('graph-explorer', () => {
    it('should open a graph explorer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({port: 1236})),
            switchMap(page => page.click('button:text("Graph Explorer")').then(() => page)),
            map(page => page.context().pages()),
            switchMap(pages => pages[1].fill('input', 'person').then(() => pages)),
            switchMap(pages => pages[1].click('button:text("By Node Label")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector('div:text("(scott)")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector('div:text("(todd)")').then(() => pages)),
        ))
    );

    it('should open a layer with the properties of a node', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({port: 1236})),
            switchMap(page => page.click('button:text("Graph Explorer")').then(() => page)),
            map(page => page.context().pages()),
            switchMap(pages => pages[1].fill('input', 'person').then(() => pages)),
            switchMap(pages => pages[1].click('button:text("By Node Label")').then(() => pages)),
            switchMap(pages => pages[1].click('div:text("+")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector(':text("name:scott")').then(() => pages)),
            switchMap(pages => pages[1].click('div:text("+")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector(':text("name:todd")')),
        ))
    );
});