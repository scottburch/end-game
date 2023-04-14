import {of, switchMap, from, tap, catchError, throwError, Observable, map} from 'rxjs'
import playwright from 'playwright'
import {access, mkdir, readFile, writeFile} from "fs/promises";
import path from "node:path";
import {Page} from 'playwright';
import {expect} from 'chai'
import * as url from "url";


export const openLoggedInCircles = () => openCircles().pipe(
    switchMap(page => page.locator('a', {hasText: 'Login'}).click().then(() => page)),
    switchMap(page => page.fill('#basic_username', 'username').then(() => page)),
    switchMap(page => page.fill('#basic_password', 'password').then(() => page)),
    switchMap(page => page.locator('button', {hasText: 'Login'}).click().then(() => page)),
    switchMap(page => page.locator('span', {hasText: 'Welcome username'}).waitFor({state: 'visible', timeout:500}).then(() => page))
);


export const openCircles = (section: string = '') => new Observable<Page>(observer => {
    let page: Page;
    const sub = of(playwright['chromium']).pipe(
        switchMap(f => f.launch({headless: false, devtools: true})),
        switchMap(browser => browser.newContext()),
        switchMap(ctx => ctx.newPage()),
        tap(p => page = p),
        switchMap(page => page.goto(`http://localhost:1234/${section}`).then(() => page)),
        tap(page => observer.next(page))
    ).subscribe();

    return () =>
        page.context().browser()?.close().then(() => sub.unsubscribe())
});

export const shotIt = (page: Page, name: string) => {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    const filename = path.resolve(__dirname, `screenshots/${name}.png`);
    return compareScreenshot().pipe(
        catchError(err => err.code === 'ENOENT' ? takeScreenshot(): throwError(err)),
        map(() => page)
    )

    function takeScreenshot() {
        return from(access(path.resolve(__dirname, 'screenshots'))).pipe(
            catchError(err => err.code === 'ENOENT' ? mkdir(path.resolve(__dirname, 'screenshots')) : throwError(() => err)),
            switchMap(() => page.screenshot()),
            switchMap(data => writeFile(filename, data))
        )
    }

    function compareScreenshot() {
        return from(readFile(filename)).pipe(
            switchMap(fileData => page.screenshot().then(screenshot => ({screenshot, fileData}))),
            map(({screenshot, fileData}) => screenshot.equals(fileData)),
            tap(isMatch => expect(isMatch, `Screenshot ${filename} does not match`).to.be.true)
        )
    }
}