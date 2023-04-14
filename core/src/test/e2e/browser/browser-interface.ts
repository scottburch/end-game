import {Page} from "playwright";
import {from, map,  of} from "rxjs";
import {PistolGraphValue, } from "../../../graph/pistolGraph.js";

// Dummy functions to fix type errors below
const w = {
    startPistol: () => of(true),
    auth: () => of(true),
    dialPeer: () => of(true),
    pistolPut: (key: string, value: PistolGraphValue) => of(true),
    pistolRead: (key: string, expectedValue: PistolGraphValue) => of(true),
    log: (text: string) => of(true)
}

export const browserStartPistol = (page: Page) => from(page.evaluate(() =>
    new Promise(resolve => w.startPistol().subscribe(resolve))
)).pipe(
    map(() => page)
);

export const browserAuth = (page: Page) => from(page.evaluate(() =>
    new Promise(resolve => w.auth().subscribe(resolve))
)).pipe(map(() => page));

export const browserDialPeer = (page: Page) => from(page.evaluate(() =>
    new Promise(resolve => w.dialPeer().subscribe(resolve))
)).pipe(map(() => page));

export const browserPistolPut = (page: Page, key: string, value: PistolGraphValue) =>
    from(page.evaluate(([key, value]) =>
        new Promise(resolve => w.pistolPut(key, value).subscribe(resolve))
    , [key, value] satisfies [string, PistolGraphValue])).pipe(map(() => page));

export const browserPistolRead = (page: Page, key: string, expectedValue: PistolGraphValue) =>
    from(page.evaluate(([key, expectedValue]) =>
        new Promise(resolve => w.pistolRead(key, expectedValue).subscribe(resolve))
    , [key, expectedValue] satisfies [string, PistolGraphValue])).pipe(
        map(response => ({value: (response as {value: PistolGraphValue}).value, page}))
    )

export const browserLog = (page: Page, text: string) =>
    from(page.evaluate(text => w.log(text), text))
