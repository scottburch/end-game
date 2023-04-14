import {firstValueFrom, switchMap, tap} from "rxjs";
import {clickHeaderMenuBtn, closeBrowser, launchApp, signup} from "./testUtils.js";

describe('signup', () => {
   it('should fail a signup for a missing username', () =>
       firstValueFrom(launchApp().pipe(
           switchMap(page => signup(page, {username: ''})),
           switchMap(page => page.waitForSelector('div:text("provide a username")').then(() => page)),
           tap(page => closeBrowser(page))
       ))
   );

    it('should fail a signup for a missing password', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {password: ''})),
            switchMap(page => page.waitForSelector('div:text("provide a password")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should fail a signup for non-matching passwords', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {password2: 'fake'})),
            switchMap(page => page.waitForSelector('div:text("do not match")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should fail a signup for a missing display name', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {displayName: ''})),
            switchMap(page => page.waitForSelector('div:text("provide a display name")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should go to login after signup', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => clickHeaderMenuBtn(page)),
            switchMap(page => page.waitForSelector('span:text("username")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );
});