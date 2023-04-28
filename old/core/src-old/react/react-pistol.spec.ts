import {delay, first, merge, switchMap, take, tap, toArray, firstValueFrom, combineLatest, map} from "rxjs";
import {Page} from 'playwright'
import {compileBrowserCode, startTestNode} from "../test/testUtils";
import {expect} from 'chai';
import {AuthenticatedEndgame, endgameLogin, endgamePut} from "../app/endgame";
import {newBrowser} from "../test/e2e/e2eTestUtils";
import {generateNewAccount} from "../crypto/crypto";


describe.skip('endgame browser tests', function () {
    this.timeout(30_000);


    it('should update react component reading a value', (done) =>
        compileBrowserCode('src/react/react-test-functions.html').pipe(
            switchMap(() => newBrowser()),
            switchMap((page: Page) => page.evaluate(
                () => {
                    // @ts-ignore
                    renderReadComponent('my.path').pipe(
                        // @ts-ignore
                        rxjs.switchMap(() => putEndgameValue('my.path', 'my new value'))
                    ).subscribe();
                }
            ).then(() => page)),
            first(),
            delay(200),
            switchMap(page => page.textContent('#value')),
            tap(value => expect(value).to.equal('my new value')),
        ).subscribe(() => done())
    );

    it('should allow endgame to logout', () =>
        firstValueFrom(compileBrowserCode('src/react/react-test-functions.html').pipe(
            switchMap(() => newBrowser()),
            switchMap((page: Page) => page.evaluate(() => {
                // @ts-ignore
                return rxjs.firstValueFrom(startEndgameReact().pipe(
                    // @ts-ignore
                    rxjs.switchMap(() => endgameLogin('username', 'password')),
                    // @ts-ignore
                    rxjs.map(() => ({authed: getEndgame()})),
                    // @ts-ignore
                    rxjs.switchMap(ctx => endgameLogout().pipe(rxjs.map(() => ctx))),
                    // @ts-ignore
                    rxjs.map(ctx => ({...ctx, unauthed: getEndgame()}))
                ))
            })),
            tap(({authed, unauthed}) => {
                expect(authed.id).to.match(/^endgame/);
                expect(unauthed.id).to.match(/^0-[0-9]*$/);
                expect(unauthed.pubKey).to.be.undefined;
                expect(unauthed.privKey).to.be.undefined;
                expect(unauthed.username).to.be.undefined;
            })
        ))
    );


    it('should display previous value for useEndgameValue()', (done) =>
        compileBrowserCode('src/react/react-test-functions.html').pipe(
            switchMap(() => startTestNode(0, [])),
            switchMap(endgame => generateNewAccount().pipe(map(keys => ({endgame: endgame, keys})))),
            switchMap(({endgame, keys}) => endgameLogin(endgame, 'me', 'password', 'my.user')),
            switchMap(({endgame}) => endgamePut(endgame as AuthenticatedEndgame, 'my.path', 'xx')),
            switchMap(() => newBrowser()),
            switchMap((page: Page) => page.evaluate(
                () => {
                    // @ts-ignore
                    renderReadComponent().pipe(
                        // @ts-ignore
                        rxjs.tap(() => reactDialPeer('ws://localhost:11110').subscribe())
                    ).subscribe()
                    // @ts-ignore

                }
            ).then(() => page)),
            switchMap(page => page.waitForSelector('#value').then(() => page.textContent('#value'))),
            tap(value => expect(value).to.equal('xx')),
            first()
        ).subscribe(() => done())
    );


    it('should update react component for keys using search criteria', () =>
        firstValueFrom(compileBrowserCode('src/react/react-test-functions.html').pipe(
            switchMap(() => startTestNode(0, [])),
            switchMap(endgame => generateNewAccount().pipe(map(keys => ({endgame: endgame, keys})))),
            switchMap(({endgame, keys}) => endgameLogin(endgame, 'me', 'password', 'my.user')),
            switchMap(({endgame}) => endgamePut(endgame as AuthenticatedEndgame, 'my.path.a', 'xx')),
            switchMap(() => newBrowser()),
            switchMap((page: Page) => page.evaluate(() =>
                new Promise(resolve =>
                    // @ts-ignore
                    renderKeysComponent({gt: 'a'}).pipe(
                        // @ts-ignore
                        rxjs.switchMap(() => putEndgameValue('my.path.b', 'xx')),
                        // @ts-ignore
                        rxjs.switchMap(() => putEndgameValue('my.path.c', 'xx'))
                    ).subscribe(resolve)
                )
            ).then(() => page)),
            switchMap(page => merge(
                page.waitForSelector('#b'),
                page.waitForSelector('#c'),
            ).pipe(
                switchMap(() => page.$('#a')),
                tap(el => expect(el).to.be.null)
            )),
            take(2)
        ))
    );

    it('should allow for multiple search criteria for keys', () =>
        firstValueFrom(compileBrowserCode('src/react/react-test-functions.html').pipe(
            switchMap(() => newBrowser()),
            switchMap((page: Page) => page.evaluate(() =>
                new Promise(resolve =>
                    // @ts-ignore
                    renderListComponent(['a','b','c','d','e','f'], {reverse: true,  lt: 'e', limit: 3}).pipe(
                    ).subscribe(resolve)
                )
            ).then(() => page)),
            switchMap(page => combineLatest([
                page.locator('.key-item').count(),
                page.waitForSelector('#d'),
                page.waitForSelector('#c'),
                page.waitForSelector('#b'),
            ])),
        ))
    );

    it('should update react component for keys', (done) =>
        compileBrowserCode('src/react/react-test-functions.html').pipe(
            switchMap(() => startTestNode(0, [])),
            switchMap(endgame => generateNewAccount().pipe(map(keys => ({endgame: endgame, keys})))),
            switchMap(({endgame, keys}) => endgameLogin(endgame, 'me', 'password', 'my.user')),
            switchMap(({endgame}) => endgamePut(endgame as AuthenticatedEndgame, 'my.path.a', 'xx')),
            switchMap(() => newBrowser()),
            switchMap((page: Page) => page.evaluate(() =>
                new Promise(resolve =>
                    // @ts-ignore
                    renderKeysComponent().pipe(
                        // @ts-ignore
                        rxjs.switchMap(() => putEndgameValue('my.path.b', 'xx')),
                        // @ts-ignore
                        rxjs.switchMap(() => putEndgameValue('my.path.c', 'xx'))
                    ).subscribe(resolve)
                )
            ).then(() => page)),
            switchMap(page => merge(
                page.waitForSelector('#a').then(() => page.textContent('#a')),
                page.waitForSelector('#b').then(() => page.textContent('#b')),
                page.waitForSelector('#c').then(() => page.textContent('#c')),
            )),
            take(3),
            toArray(),
            tap(items => expect(items).to.deep.equal(['a', 'b', 'c']))
        ).subscribe(() => done())
    );


});



