import {Page} from "playwright";
import {from, map,  of} from "rxjs";
import {EndgameGraphValue, } from "../../../graph/endgameGraph";

// Dummy functions to fix type errors below
const w = {
    startPistol: () => of(true),
    auth: () => of(true),
    dialPeer: () => of(true),
    pistolPut: (key: string, value: EndgameGraphValue) => of(true),
    pistolRead: (key: string, expectedValue: EndgameGraphValue) => of(true),
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

export const browserPistolPut = (page: Page, key: string, value: EndgameGraphValue) =>
    from(page.evaluate(([key, value]) =>
        new Promise(resolve => w.pistolPut(key, value).subscribe(resolve))
    , [key, value] satisfies [string, EndgameGraphValue])).pipe(map(() => page));

export const browserPistolRead = (page: Page, key: string, expectedValue: EndgameGraphValue) =>
    from(page.evaluate(([key, expectedValue]) =>
        new Promise(resolve => w.pistolRead(key, expectedValue).subscribe(resolve))
    , [key, expectedValue] satisfies [string, EndgameGraphValue])).pipe(
        map(response => ({value: (response as {value: EndgameGraphValue}).value, page}))
    )

export const browserLog = (page: Page, text: string) =>
    from(page.evaluate(text => w.log(text), text))
