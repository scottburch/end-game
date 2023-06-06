import {combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {signupHelper, startAppNetwork, connectBrowsers, postHelper} from "./utils/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from 'chai';

describe('post', () => {
    it('should update the users profile', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => signupHelper(page)),
            switchMap(page => of(page).pipe(
                switchMap(() => page.fill('#post-text', 'post1')),
                switchMap(() => page.click('button:text("Add post")')),
                switchMap(() => page.waitForSelector('a:text("Scooter")')),

                switchMap(() => page.click('a:text("Welcome")')),
                switchMap(() => page.fill('input#display', 'Me')),
                switchMap(() => page.click('button:text("Update profile")')),
                switchMap(() => page.waitForSelector('a:text("Me")'))
            )),
        ))
    );

    it('should update the users profile across peers', () =>
        firstValueFrom(startAppNetwork().pipe(
            switchMap(({page0, page1}) => of(undefined).pipe(
                switchMap(() => connectBrowsers(page0, page1)),
                switchMap(() => signupHelper(page0)),
                switchMap(() => page0.waitForSelector(':text("Add a post")')),
                switchMap(() => page0.click('#welcome')),
                switchMap(() => combineLatest([
                    page0.inputValue('input#display'),
                    page0.inputValue('textarea#about-me'),
                ])),
                tap(([display, aboutMe]) => {
                    expect(display).to.equal('Scooter');
                    expect(aboutMe).to.equal('Here I am');
                }),
                switchMap(() => postHelper(page0)),
                switchMap(() => page1.click('a:text("Scooter")')),
                switchMap(() => page1.waitForSelector('h3:text("Profile for Scooter")')),
                switchMap(() => page0.fill('input#display', 'Elser')),
                switchMap(() => page0.click('button:text("Update profile")')),
                switchMap(() => page1.waitForSelector('h3:text("Profile for Elser")')),
                switchMap(() => page1.waitForSelector('a:text("Elser")'))
            ))
        ))
    )
})