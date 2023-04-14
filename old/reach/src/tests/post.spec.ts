import {concatMap, firstValueFrom, last, map, range, switchMap, tap} from "rxjs";
import {
    addPost,
    closeBrowser,
    goToHomePage,
    launchApp,
    login,
    logout, selectFromSideMenu,
    signup
} from "./testUtils.ts";
import {expect} from "chai";

describe('posts', () => {
    it('should be able to add a post', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => addPost(page, 'here is my text')),
            switchMap(page => page.waitForSelector('div:text("here is my text")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('should display posts in reverse order', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => addPost(page, 'first')),
            switchMap(page => addPost(page, 'second')),
            switchMap(page => addPost(page, 'third')),
            switchMap(page => page.click('a:text("display name")').then(() => page)),
            switchMap(page => page.waitForURL(/user\/profile\//).then(() => page)),
            switchMap(page => page.waitForSelector('div:text("display name")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it('it should allow infinite scroll for posts', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => range(1,40).pipe(
                concatMap(n => addPost(page, `post-${n}`)),
                map(() => page)
            )),
            last(),
            switchMap(goToHomePage),
            tap(page => closeBrowser(page))
        ))
    );

    it('can handle a long message', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => addPost(page, 'word '.repeat(500))),
            tap(page => closeBrowser(page))
        ))
    );

    it('should show the latest posts on home page', () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {})),
            switchMap(page => range(1,15).pipe(
                concatMap(n => addPost(page, `post-${n}`)),
                map(() => page)
            )),
            last(),
            switchMap(goToHomePage),
            switchMap(page => range(6, 10).pipe(
                concatMap(n => page.waitForSelector(`div:text("post-${n}")`).then(() => page))
            )),
            last(),
            switchMap(page => page.locator('a:text("display name")').count().then(count => ({count, page}))),
            tap(({count}) => expect(count).to.equal(10)),
            switchMap(({page}) => range(6, 10).pipe(
                concatMap(n => page.waitForSelector(`div:text("post-${n}")`).then(() => page))
            )),
            last(),
            tap(page => closeBrowser(page))
        ))
    );

    it("should allow me to get my mentions", () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {username: 'alice', displayName: 'Alice', nickname: 'alice'})),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'bob', displayName: 'Bob', nickname: 'bob'})),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'alfi', displayName: 'Alfi', nickname: 'alfi'})),
            switchMap(page => addPost(page, 'this message is for @bob and @alice')),
            switchMap(logout),
            switchMap(page => login(page, 'alice')),
            switchMap(page => selectFromSideMenu(page, 'My Mentions')),
            switchMap(page => page.waitForSelector('div:text("this message is for @bob and @alice")').then(() => page)),
            switchMap(logout),
            switchMap(page => login(page, 'bob')),
            switchMap(page => selectFromSideMenu(page, 'My Mentions')),
            switchMap(page => page.waitForSelector('div:text("this message is for @bob and @alice")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it("should follow mentions in messages to a profile", () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {username: 'alice', displayName: 'Alice', nickname: 'alice'})),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'bob', displayName: 'Bob', nickname: 'bob'})),
            switchMap(logout),
            switchMap(page => signup(page, {username: 'alfi', displayName: 'Alfi', nickname: 'alfi'})),
            switchMap(page => addPost(page, 'this message is for @bob and @alice')),
            switchMap(logout),

            switchMap(page => selectFromSideMenu(page, 'Home')),
            switchMap(page => page.waitForSelector('div:text("this message is for @bob and @alice")').then(() => page)),
            switchMap(page => page.click('a:text("@bob")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("about me")').then(() => page)),

            switchMap(page => selectFromSideMenu(page, 'Home')),
            switchMap(page => page.waitForSelector('div:text("this message is for @bob and @alice")').then(() => page)),
            switchMap(page => page.click('a:text("@alice")').then(() => page)),
            switchMap(page => page.waitForSelector('div:text("about me")').then(() => page)),

            tap(page => closeBrowser(page))
        ))
    );

    it("should error if the nickname does not exist", () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {username: 'alice', displayName: 'Alice', nickname: 'alice'})),
            switchMap(page => addPost(page, 'this message is for @fake')),
            switchMap(page => page.waitForSelector('div.ant-alert-message:text("Nickname not found")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

    it("should add tags to a message", () =>
        firstValueFrom(launchApp().pipe(
            switchMap(page => signup(page, {username: 'alice', displayName: 'Alice', nickname: 'alice'})),
            switchMap(page => addPost(page, 'this message has a #tagger and #another-tagger')),
            switchMap(page => page.waitForSelector('div:text("this message has a #tagger and #another-tagger")').then(() => page)),
            switchMap(page => page.click('a:text("#tagger")').then(() => page)),
            switchMap(page => page.waitForURL(/\/tag\/posts\/tagger/).then(() => page)),
            switchMap(page => page.waitForSelector('div:text("this message has")').then(() => page)),
            tap(page => closeBrowser(page))
        ))
    );

});