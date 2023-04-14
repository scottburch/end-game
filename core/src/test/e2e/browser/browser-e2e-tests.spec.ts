import {compileBrowserCode, newTestPistol} from "../../testUtils.js";
import {combineLatest, filter, firstValueFrom, of, skipWhile, switchMap, tap} from "rxjs";
import {newBrowser} from "../e2eTestUtils.js";
import {
    browserAuth,
    browserDialPeer,
    browserPistolPut,
    browserPistolRead,
    browserStartPistol
} from "./browser-interface.js";
import {pistolGet} from "../../../app/pistol.js";

import {expect} from "chai";

describe.skip('browser e2e tests', () => {

    it('should write from a browser to a node and back to a browser', () =>
        firstValueFrom(compileBrowserCode('src/test/e2e/browser/browser-tests.html').pipe(
            switchMap(() => combineLatest([newTestPistol(), newBrowser(), newBrowser()])),
            switchMap(([pistol, page1, page2]) => of(true).pipe(
                switchMap(() => browserStartPistol(page1)),
                switchMap(() => browserStartPistol(page2)),
                switchMap(() => browserAuth(page1)),
                switchMap(() => browserDialPeer(page1)),
                switchMap(() => browserDialPeer(page2)),
                switchMap(() => browserPistolPut(page1, 'some.key', 'some-value')),
                switchMap(() => firstValueFrom(pistolGet(pistol, 'some.key').pipe(
                    skipWhile(({value}) => value !== 'some-value')
                ))),
                filter((_, idx) => idx === 0),
                switchMap(() => browserPistolRead(page2, 'some.key', 'some-value')),
                tap(({value}) => expect(value).to.equal('some-value'))
            ))
        ))
    );

});