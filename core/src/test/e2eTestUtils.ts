import playwright, {Page} from "playwright";
import {map, Observable, of, switchMap, tap} from "rxjs";
import {Parcel} from '@parcel/core';


export const newBrowser = () => new Observable(observer => {
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


export const compileBrowserCode = (src: string) =>
    of({
        entries: src,
        defaultConfig: '@parcel/config-default',
        serveOptions: {
            port: 1234
        },
    }).pipe(
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
                    throw result
                }
            })
                .then(bs => bundlerSub = bs)
            return () =>
                of(bundlerSub).pipe(
                    switchMap(bundlerSub => bundlerSub.unsubscribe()),
                ).subscribe();
        })));


