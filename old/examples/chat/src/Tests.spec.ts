import {describe, it} from 'mocha'
import {of, switchMap, firstValueFrom, tap} from 'rxjs'
import playwright, {Page} from 'playwright'
import {expect} from "chai";
describe('Application tests', () => {
    it('should login', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(login),
            switchMap(page => page.getByText('Welcome username').textContent().then(content => ({content, page}))),
            tap(({content}) => expect(content).to.equal('Welcome username')),
            tap(({page}) => closeBrowser(page))
        ))
    );

    it('should count', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(login),

            switchMap(page => page.locator('button', {hasText: 'Press me'}).click().then(() => page)),
            switchMap(page => page.textContent('span#count').then(count => ({count, page}))),
            tap(({count}) => expect(count).to.equal('1')),

            switchMap(({page}) => page.locator('button', {hasText: 'Press me'}).click().then(() => page)),
            switchMap(page => page.textContent('span#count').then(count => ({count, page}))),
            tap(({count}) => expect(count).to.equal('2')),
            tap(({page}) => closeBrowser(page))
        ))
    )

    const launchApp = () => of(playwright['chromium']).pipe(
        switchMap(f => f.launch({headless: !!process.env.CI})),
        switchMap(browser => browser.newContext()),
        switchMap(ctx => ctx.newPage()),
        switchMap(page => page.goto(`http://localhost:1234`).then(() => page))
    );

    const login = (page: Page) => of(page).pipe(
        switchMap(page => page.locator('input#username').fill('username').then(() => page)),
        switchMap(page => page.locator('input#password').fill('password').then(() => page)),
        switchMap(page => page.locator('button', {hasText:'Login'}).click().then(() => page)),
    );

    const closeBrowser = (page: Page) => of(page).pipe(
        tap(page => page.context().browser()?.close())
    ).subscribe();
});