import playwright, {Page} from "playwright";
import {map, Observable, of, switchMap, tap} from "rxjs";
import {Parcel} from '@parcel/core';
import {writeFile} from "fs/promises";


export const newBrowser = () => new Observable<Page>(observer => {
    let openPage: Page;
    const sub = of(playwright['chromium']).pipe(
        switchMap(f => f.launch({headless: !!process.env.CI, devtools: true})),
        switchMap(browser => browser.newContext()),
        switchMap(ctx => ctx.newPage()),
        switchMap(page => page.goto('http://localhost:1234').then(() => page)),
        tap(page => openPage = page),
        tap(page => observer.next(page))
    ).subscribe()

    return () => {
        sub.unsubscribe();
        openPage.context().browser()?.close();
    }
})


export const compileBrowserTestCode = (src: string) =>
    of(`<div id="app"></div><script src="../${src}" type="module"></script>`).pipe(
        switchMap(html => writeFile('src/test/test.html', html)),
        map(() => ({
            entries: 'src/test/test.html',
            defaultConfig: '@parcel/config-default',
            shouldDisableCache: true,
            serveOptions: {
                port: 1234
            },
        })),
        map(config => new Parcel(config)),
        switchMap(bundler => new Observable(sub => {
            let bundlerSub: { unsubscribe: () => Promise<any> };
            bundler.watch((err, result) => {
                if (err) {
                    throw err
                }
                if (result?.type === 'buildSuccess') {
                    sub.next(result)
                } else {
                    console.error('BUILD_FAILURE', result?.diagnostics)
                    throw result
                }
            })
                .then(bs => bundlerSub = bs)
            return () =>
                of(bundlerSub).pipe(
                    switchMap(bundlerSub => bundlerSub.unsubscribe()),
                ).subscribe();
        })));


