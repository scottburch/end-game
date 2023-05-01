import {delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {$} from 'zx'
import {createApp} from "./test/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";


describe('create app', function () {
    this.timeout(40_000);
    it('should create a working demo app', () =>
        firstValueFrom(createApp().pipe(
            map(() => $`yarn dev-headless`),
            delay(3000),
            switchMap(proc => of(true).pipe(
                // test app starts
                switchMap(() => openBrowser()),
                switchMap(page => page.waitForSelector('text=Task:')),
                tap(() => proc.kill())
            ))
        ))
    )
});