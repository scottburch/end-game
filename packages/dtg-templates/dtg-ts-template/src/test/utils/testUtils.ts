import {combineLatest, map, merge, of, switchMap} from "rxjs";
import {Page} from 'playwright-core'
import {startTestNet} from "@end-game/test-utils";
import {openBrowser} from "@end-game/utils/openBrowser";

export const signupHelper = (page: Page) =>
    of(page).pipe(
        switchMap(page => of(page).pipe(
            switchMap(() => page.click(':text("signup")')),
            switchMap(() => page.fill('#signup_username', 'scott')),
            switchMap(() => page.fill('#signup_password', '12345')),
            switchMap(() => page.fill('#signup_password2', '12345')),
            switchMap(() => page.fill('#signup_displayName', 'Scooter')),
            switchMap(() => page.fill('#signup_nickname', 'scooter')),
            switchMap(() => page.fill('#signup_aboutMe', 'Here I am')),
            switchMap(() => page.click('button>:text("Signup")')),
            switchMap(() => page.waitForSelector('div:text("scott")')),
            map(() => page)
        ))
    );

export const startAppNetwork = () =>
    combineLatest([
        startTestNet([[2], [2], []]),
        openBrowser(),
        openBrowser()
    ]).pipe(
        map(([{host0, host1, host2}, page0, page1]) => ({
            host0, host1, host2, page0, page1
        }))
    );

export const connectBrowsers = (page0: Page, page1: Page) =>
    merge(
        page0.click('button:text("Peer 0")'),
        page1.click('button:text("Peer 1")')
    );

export const postHelper = (page: Page, text: string = 'my post') =>
    of(page).pipe(
        switchMap(() => clickUserMenu(page)),
        switchMap(() => page.waitForSelector(':text("Add Post")')),
        switchMap(() => page.click(':text("Add Post")')),
        switchMap(() => page.fill('#add-post_text', text)),
        switchMap(() => page.click('button>:text("Add post")'))
    );

export const clickUserMenu = (page: Page) =>
    page.click('#user-menu-btn');

