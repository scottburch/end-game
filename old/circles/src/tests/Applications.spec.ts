import {firstValueFrom, switchMap} from "rxjs";
import {openCircles, openLoggedInCircles} from "./testUtils.ts";
import {browserPistolRead} from '@scottburch/pistol/lib/test/e2e/browser/browser-interface.js'

describe('Applications page', () => {
    it('should set the submission form disabled if not logged in', () =>
        firstValueFrom(openCircles().pipe(
            switchMap(page => page.locator('span', {hasText: 'Applications'}).click().then(() => page)),
            switchMap(page => page.locator('input[disabled]').waitFor())
        ))
    );

    it('should show errors when form left blank', () =>
        firstValueFrom(openLoggedInCircles().pipe(
            switchMap(page => page.locator('li', {hasText: 'Applications'}).click().then(() => page)),
            switchMap(page => page.locator('button', {hasText: 'Submit application'}).click().then(() => page)),
            switchMap(page => page.locator('div#basic_url_help', {hasText: 'Please provide a url'}).waitFor().then(() => page)),
        ))
    );

    it("should require the proposed application form have a valid url", () =>
        firstValueFrom(openLoggedInCircles().pipe(
            switchMap(page => page.locator('li', {hasText: 'Applications'}).click().then(() => page)),
            switchMap(page => page.fill('input#basic_url', 'http').then(() => page)),
            switchMap(page => page.locator('div#basic_url_help', {hasText: 'Please provide a valid URL'}).waitFor().then(() => page)),
            switchMap(page => page.fill('input#basic_url', 'http://something').then(() => page)),
            switchMap(page => page.locator('div#basic_url_help', {hasText: 'Please provide a valid URL'}).waitFor().then(() => page)),
            switchMap(page => page.fill('input#basic_url', 'http://something.com').then(() => page)),
            switchMap(page => page.waitForSelector('div#basic_url_help', {state: 'detached'})),
        ))
    );

    it('should add a proposed application when form is submitted', () =>
        firstValueFrom(openLoggedInCircles().pipe(
            switchMap(page => page.locator('li', {hasText: 'Applications'}).click().then(() => page)),
            switchMap(page => page.fill('input#basic_url', 'http://my-app.com').then(() => page)),
            switchMap(page => page.fill('textarea#basic_description', 'my-description').then(() => page)),
            switchMap(page => page.locator('button', {hasText: 'Submit application'}).click().then(() => page)),
            switchMap(page => browserPistolRead(page, 'circles-web.app-submit.687474703a2f2f6d792d6170702e636f6d', '{"url":"http://my-app.com","description":"my-description"}')),
        ))
    );


});