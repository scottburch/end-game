
import {combineLatest, map, merge, of, switchMap} from "rxjs";
import {Page} from 'playwright-core'
import {startTestNet} from "@end-game/test-utils";
import {openBrowser} from "@end-game/utils/openBrowser";

export const signupHelper = (page: Page) =>
    of(page).pipe(
        switchMap(page => of(page).pipe(
            switchMap(() => page.click(':text("signup")')),
            switchMap(() => page.fill('#username', 'scott')),
            switchMap(() => page.fill('#password', 'pass')),
            switchMap(() => page.fill('#display', 'Scooter')),
            switchMap(() => page.fill('#about-me', 'Here I am')),
            switchMap(() => page.click('button:text("Signup")')),
            map(() => page)
        ))
    );

export const startAppNetwork = () =>
    combineLatest([
        startTestNet([[2], [2], []]),
        openBrowser(),
        openBrowser()
    ]).pipe(
        map(([{node0, node1, node2}, page0, page1]) => ({
            node0, node1, node2, page0, page1
        }))
    );

export const connectBrowsers = (page0: Page, page1: Page) =>
    merge(
        page0.click('button:text("Peer 0")'),
        page1.click('button:text("Peer 1")')
    );

export const postHelper = (page: Page, text: string = 'my post') =>
    of(page.fill('#post-text', text)).pipe(
        switchMap(() => page.click('button:text("Add Post")'))
    )

