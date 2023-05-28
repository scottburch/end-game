import {combineLatest, firstValueFrom, switchMap, tap} from "rxjs";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";
import {startTestNode} from "@end-game/test-utils";
import {openBrowser} from "@end-game/utils/openBrowser";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {graphPutNode, newGraphNode} from "@end-game/graph";
import {expect} from "chai";

describe('dialer', () => {
    it('should dial a peer', () =>
        firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'dialer-test.tsx')).pipe(
            switchMap(() => startTestNode(5)),
            switchMap(({graph}) => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            tap(({graph}) => graphPutNode(graph, newGraphNode('thing1', 'thing', {name: 'thing1'})).subscribe()),
             tap(({graph}) => graphPutNode(graph, newGraphNode('thing2', 'thing', {name: 'thing2'})).subscribe()),
            switchMap(({graph}) => openBrowser()),
            switchMap(page => combineLatest([
                page.textContent('#thing1'),
                page.textContent('#thing2')
            ])),
            tap(things => expect(things).to.deep.equal(['thing1', 'thing2'])),
        ))
    )
})