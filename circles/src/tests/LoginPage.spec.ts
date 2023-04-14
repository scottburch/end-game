/**
 * @jest-environment node
 */

import {firstValueFrom, switchMap, tap} from "rxjs";
import {openCircles, openLoggedInCircles} from "./testUtils";


describe('Login tests', () => {

    it('should display a username error if the username is missing', () =>
        firstValueFrom(openCircles().pipe(
            switchMap(page => page.locator('a', {hasText: 'Login'}).click().then(() => page)),
            switchMap(page => page.locator('button', {hasText: 'Login'}).click().then(() => page)),
            switchMap(page => page.locator('div.ant-form-item-explain-error', {hasText: 'Please input your username'}).click().then(() => page)),
            switchMap(page => page.locator('div.ant-form-item-explain-error', {hasText: 'Please input your password'}).click().then(() => page)),
        ))
    );

    it('should logout', () =>
        firstValueFrom(openLoggedInCircles().pipe(
            switchMap(page => page.locator('a', {hasText: 'Logout'}).click().then(() => page)),
            switchMap(page => page.locator('a', {hasText: 'Login'}).waitFor())
        ))
    );
});