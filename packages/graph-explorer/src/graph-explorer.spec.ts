import {firstValueFrom, from, last, map, switchMap} from "rxjs";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {openBrowser} from "@end-game/utils/openBrowser";
import type {Page} from 'playwright'


const triggerExplorer = (page: Page) =>
    page.evaluate(() => {
        document.dispatchEvent(new KeyboardEvent('keypress', {ctrlKey: true, key: 'G'}))
    }).then(() => page.context().pages()[1]);

describe('graph-explorer', () => {
    it('should open a graph explorer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({url: 'http://localhost:1236'})),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(triggerExplorer),
            switchMap(page => page.fill('input', 'person').then(() => page)),
            switchMap(page => page.click('button:text("By Node Label")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("(scott)")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("(todd)")').then(() => page))
        ))
    );

    it('should open a layer with the properties/relationships of a node', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({url: 'http://localhost:1236'})),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.evaluate(() =>
                document.dispatchEvent(new KeyboardEvent('keypress', {ctrlKey: true, key: 'G'}))
            ).then(() => page)),
            map(page => page.context().pages()[1]),
            switchMap(page => page.fill('input', 'person').then(() => page)),
            switchMap(page => page.click('button:text("By Node Label")').then(() => page)),
            switchMap(page => from(page.locator('div:text("+")').all()).pipe(
                switchMap(locators => from(locators)),
                switchMap(locator => locator.click()),
                last(),
                map(() => page)
            )),
            switchMap(page => page.waitForSelector(':text("name:scott")').then(() => page)),
            switchMap(page => page.waitForSelector(':text("name:todd")'))
        ))
    );
});