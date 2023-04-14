import {concatMap, map, of, switchMap, tap} from "rxjs";
import * as playwright from "playwright";
import {Page} from "playwright";
import {User, UserProfile} from "../services/userService.js";

export const launchApp = () => of(playwright['chromium']).pipe(
    switchMap(f => f.launch({headless: !!process.env.CI})),
    switchMap(browser => browser.newContext()),
    switchMap(ctx => ctx.newPage()),
    switchMap(page => page.goto(`http://localhost:1234`).then(() => page))
);

export const login = (page: Page, username: string = 'username', password: string = 'password') => of(page).pipe(
    switchMap(clickHeaderMenuBtn),
    switchMap(page => page.locator('button', {hasText: 'Login'}).click().then(() => page)),
    switchMap(page => page.locator('input#username').fill(username).then(() => page)),
    switchMap(page => page.locator('input#password').fill(password).then(() => page)),
    switchMap(page => page.locator('button[type="submit"]', {hasText:'Login'}).click().then(() => page)),
);

export const signup = (page: Page, values: Partial<User & UserProfile & {password2: string}>) =>
    of(page).pipe(
        switchMap(clickHeaderMenuBtn),
        switchMap(() => page.locator('button', {hasText: 'Login'}).click()),
        switchMap(() => page.locator('a', {hasText: 'Signup'}).click()),
        map(() => values),
        map(values => ({
            owner: '',
            username: 'username',
            aboutMe: 'about me',
            displayName: 'display name',
            nickname: 'nickname',
            password: 'password',
            password2: 'password',
            ...values
        } satisfies User & UserProfile & {password2: string})),
        switchMap(values => of(values).pipe(
            concatMap(() => page.locator('input#username').fill(values.username)),
            concatMap(() => page.locator('input#displayName').fill(values.displayName)),
            concatMap(() => page.locator('input#nickname').fill(values.nickname)),
            concatMap(() => page.locator('input#password').fill(values.password)),
            concatMap(() => page.locator('input#password2').fill(values.password2)),
            concatMap(() => page.locator('textarea#aboutMe').fill(values.aboutMe)),
            concatMap(() => page.locator('button', {hasText: 'Signup'}).click())
        )),
        map(() => page)
    );

export const clickHeaderMenuBtn = (page: Page) => of(page).pipe(
    switchMap(page => page.locator('#header-menu-btn').click().then(() => page)),
);

export const selectFromSideMenu = (page: Page, itemText: string) =>
    clickHeaderMenuBtn(page).pipe(
        switchMap(() => page.click(`a:text("${itemText}")`)),
        map(() => page)
);

export const goToHomePage = (page: Page) => of(page).pipe(
    switchMap(clickHeaderMenuBtn),
    switchMap(page => page.click('a:text("Home")').then(() => page))
)

export const addPost = (page: Page, text: string) => of(page).pipe(
    switchMap(clickHeaderMenuBtn),
    switchMap(page => page.locator('a', {hasText: 'New Post'}).click().then(() => page)),
    switchMap(page => page.locator('textarea#text').fill(text).then(() => page)),
    switchMap(page => page.locator('button', {hasText: 'New Post'}).click().then(() => page))
);

export const logout = (page: Page) => of(page).pipe(
    switchMap(clickHeaderMenuBtn),
    switchMap(page => page.locator('button', {hasText: 'Logout'}).click().then(() => page))
);

export const closeBrowser = (page: Page) => of(page).pipe(
    tap(page => page.context().browser()?.close())
).subscribe();
