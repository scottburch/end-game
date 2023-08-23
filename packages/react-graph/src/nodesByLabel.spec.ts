import {combineLatest, delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";

import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {addThingNode, startTestNet, startTestNode} from "@end-game/test-utils";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";


describe("nodesByLabel()", () => {
    it('should update reactively', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'nodesByLabel-test.tsx')).pipe(
            switchMap(() => openBrowser()),
            switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => page.click('#count').then(() => page)),
            switchMap(page => combineLatest([
                page.textContent('#thing1'),
                page.textContent('#thing2'),
                page.textContent('#thing3'),
            ])),
            tap(([s1, s2, s3]) => {
                expect(s1).to.equal('thing1')
                expect(s2).to.equal('thing2')
                expect(s3).to.equal('thing3')
            })
        ))
    );

    it('should update across browsers with a two peer network', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'nodesByLabel-test.tsx')).pipe(
            switchMap(() => combineLatest([
                openBrowser().pipe(
                    switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
                ),
                openBrowser().pipe(
                    switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
                ),
                startTestNet([[], [0]], {graphId: 'testGraph', basePort: 11117})
            ])),
            map(([page0, page1, {host0, host1}]) => ({page0, page1, graph0: host0.graphs[0], graph1: host1.graphs[0]})),
            switchMap(({page0, page1, graph0, graph1}) =>
                of(undefined).pipe(
                    switchMap(() => of(undefined).pipe(
                        switchMap(() => graphNewAuth(graph0, 'username', 'password')),
                        switchMap(({graph}) => graphAuth(graph, 'username', 'password')),
                        switchMap(() => addThingNode(graph0, 1, {})),
                        switchMap(() => addThingNode(graph0, 2, {}))
                    )),
                    delay(1000),
                    switchMap(() => page0.click('#connect0')),
                    switchMap(() => page1.click('#connect1')),
                    switchMap(() => addThingNode(graph0, 3, {})),
                    delay(1000),
                    switchMap(({graph}) => addThingNode(graph, 4, {})),
                    map(() => ({page0, page1})
                ),
            )),
            switchMap(({page0, page1}) => combineLatest([
                page1.waitForSelector('div:text("thing0001")'),
                page1.waitForSelector('div:text("thing0002")'),
                page1.waitForSelector('div:text("thing0003")'),
                page1.waitForSelector('div:text("thing0004")')
            ])),
        ))
    );
});