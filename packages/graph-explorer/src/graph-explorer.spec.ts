import {delay, firstValueFrom, map, switchMap, tap} from "rxjs";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";

describe('graph-explorer', () => {
    it('should open a graph explorer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({port: 1236})),
            switchMap(page => page.click('button:text("Graph Explorer")').then(() => page)),
            map(page => page.context().pages()),
            switchMap(pages => pages[1].fill('input', 'person').then(() => pages)),
            switchMap(pages => pages[1].click('button:text("By Node Label")').then(() => pages)),
            map(pages => pages[1].getByText('person')),
            switchMap(locator => locator.count()),
            tap(count => expect(count).to.equal(3))
        ))
    );

    it('should open a layer with the properties of a object', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'graph-explorer-test.tsx'), 1236).pipe(
            switchMap(() => openBrowser({port: 1236})),
            switchMap(page => page.click('button:text("Graph Explorer")').then(() => page)),
            map(page => page.context().pages()),
            switchMap(pages => pages[1].fill('input', 'person').then(() => pages)),
            switchMap(pages => pages[1].click('button:text("By Node Label")').then(() => pages)),
            // TODO: Finish here
            delay(100000000)
        ))
    );
});