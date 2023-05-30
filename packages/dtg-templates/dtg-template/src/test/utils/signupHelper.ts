
import {map, of, switchMap} from "rxjs";
import {Page} from 'playwright-core'

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
    )