import {firstValueFrom, switchMap, tap} from "rxjs";
import {addPost, closeBrowser, goToHomePage, launchApp, logout, selectFromSideMenu, signup} from "./testUtils.js";
import {expect} from "chai";

describe('user functions', () => {
    it('should allow users to see profiles of other users', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => addPost(page, 'here is my text')),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'user2', displayName: 'User 2'})),
            switchMap(goToHomePage),
            switchMap(page => page.click('a:text("display name")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("About me")').then(() => page)),
            switchMap(page => page.click('a:text("Messages")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("here is my text")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should be able to search for users', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {username: 'alice', displayName: 'Alice', nickname: 'alice'})),
            switchMap(page => addPost(page, 'alices message')),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'bob', displayName: 'Bob', nickname: 'bob'})),
            switchMap(page => addPost(page, 'bobs message')),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'alfi', displayName: 'Alfi', nickname: 'alfi'})),
            switchMap(page => addPost(page, 'alfis message')),
            switchMap(logout),
            switchMap(page => page.locator('#user-search input').fill('alfi').then(() => page)),
            switchMap(page => page.click('#user-search button').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("@alfi")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should be able to edit a profile', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {username: 'alice', displayName: 'Alice', nickname: 'alice'})),
            switchMap(page => selectFromSideMenu(page, 'My Profile')),
            switchMap(page => page.fill('input#displayName', 'new display name').then(() => page)),
            switchMap(page => page.click('button span:text("Update Profile")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("Your profile has been updated.")').then(() => page)),
            switchMap(page => selectFromSideMenu(page, 'Home')),
            switchMap(page => selectFromSideMenu(page, 'My Profile')),
            switchMap(page => page.inputValue('#displayName')
                .then(name => expect(name).to.equal('new display name'))
                .then(() => page)
            ),
            tap(page => closeBrowser(page))
        ))
    );


});