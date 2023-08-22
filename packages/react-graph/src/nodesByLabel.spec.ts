import {combineLatest, delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";

import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {addThingNode, startTestNode} from "@end-game/test-utils";
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

    it('should update from remote peer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'nodesByLabel-test.tsx')).pipe(
            switchMap(() => combineLatest([
                openBrowser().pipe(
                    switchMap(page => page.waitForSelector('div:text("scott")').then(() => page)),
                ),
                startTestNode(0, [], {graphId: 'testGraph', basePort: 11117})
            ])),
            map(([page, {host}]) => ({page, graph: host.graphs[0]})),
            switchMap(({page, graph}) => page.click('#connect').then(() =>({page, graph}))),
            switchMap(({page, graph}) =>
                of(undefined).pipe(
                    switchMap(() => graphNewAuth(graph, 'username', 'password')),
                    switchMap(({graph}) => graphAuth(graph, 'username', 'password')),
                    switchMap(({graph}) => addThingNode(graph, 1, {})),
                    switchMap(({graph}) => addThingNode(graph, 2, {})),
                    switchMap(({graph}) => addThingNode(graph, 3, {})),
                    map(() => page)
                ),
            ),
            switchMap(page => page.waitForSelector('div:text("thing0001")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("thing0002")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("thing0003")').then(() => page)),
        ))
    )
});