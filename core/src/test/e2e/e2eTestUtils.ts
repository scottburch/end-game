import playwright, {Page} from "playwright";
import {map, of, switchMap, tap} from "rxjs";

let openPages: Page[] = [];


afterEach(() => {
    return Promise.all(openPages.map(page => page.context().browser()?.close())).then(() => openPages = []);
});


export const newBrowser = () =>
    of(playwright['chromium']).pipe(
        switchMap(f => f.launch({headless: !!process.env.CI, devtools: true})),
        switchMap(browser => browser.newContext()),
        switchMap(ctx => ctx.newPage()),
        switchMap(page => page.goto('http://localhost:1234').then(() => page)),
        tap(page => openPages.push(page)),
        map(page => page as Page)
    );




