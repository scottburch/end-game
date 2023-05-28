import {delay, firstValueFrom, from, last, map, of, switchMap} from "rxjs";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {openBrowser} from "@end-game/utils/openBrowser";


describe('graph-explorer', () => {
    it('should open a graph explorer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({port: 1236})),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.click('button:text("Graph Explorer")').then(() => page)),
            map(page => page.context().pages()),
            switchMap(pages => pages[1].fill('input', 'person').then(() => pages)),
            delay(4000),
            switchMap(pages => pages[1].click('button:text("By Node Label")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector('div:text("(scott)")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector('div:text("(todd)")').then(() => pages))
        ))
    );

    it('should open a layer with the properties/relationships of a node', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({port: 1236})),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            delay(4000),
            switchMap(page => page.click('button:text("Graph Explorer")').then(() => page)),
            map(page => page.context().pages()),
            switchMap(pages => pages[1].fill('input', 'person').then(() => pages)),
            switchMap(pages => pages[1].click('button:text("By Node Label")').then(() => pages)),
            delay(1000),
            switchMap(pages => of(pages[1]).pipe(
                switchMap(page => page.locator('div:text("+")').all()),
                switchMap(locators => from(locators)),
                switchMap(locator => locator.click()),
                last(),
                map(() => pages)
            )),
            switchMap(pages => pages[1].waitForSelector(':text("name:scott")').then(() => pages)),
            switchMap(pages => pages[1].waitForSelector(':text("name:todd")'))
        ))
    );
});