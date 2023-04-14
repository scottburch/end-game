import {describe, it} from 'mocha'
import {switchMap, firstValueFrom, tap} from 'rxjs'
import {clickHeaderMenuBtn, closeBrowser, launchApp, login, logout, signup} from "./testUtils.js";


describe('Login tests', () => {
    it('should fail login if user does not exist', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => login(page)),
            switchMap(page => page.waitForSelector('div:text("Login Failed")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should logout', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(logout),
            switchMap(page => login(page)),
            switchMap(page => clickHeaderMenuBtn(page)),
            switchMap(page => page.waitForSelector('span:text("username")').then(() => page)),
            tap(closeBrowser)
        ))
    )

});