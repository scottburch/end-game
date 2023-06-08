import {Observable, of, switchMap, tap} from 'rxjs'
import type {Page} from 'playwright'
import playwright from "playwright";

export const openBrowser = ({url}: {url?: string} = {}) => new Observable<Page>(subscriber => {
    let openPage: Page;
    const sub = of(playwright['chromium']).pipe(
        switchMap(f => f.launch({headless: !!process.env.CI, devtools: true})),
        switchMap(browser => browser.newContext()),
        switchMap(ctx => ctx.newPage()),
        switchMap(page => page.goto(url || 'http://localhost:1234').then(() => page)),
        tap(page => openPage = page),
        tap(page => subscriber.next(page))
    ).subscribe()

    return () => {
        sub.unsubscribe();
        openPage.context().browser()?.close();
    }
})

