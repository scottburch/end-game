import {delay, firstValueFrom, map, of, switchMap} from "rxjs";
import {$} from 'zx'
import {createApp} from "./test/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";

 describe('create app', function () {
    this.timeout(120_000);
    it('should create a working demo app', () =>
        firstValueFrom(createApp().pipe(
            map(() => $`yarn run dev --headless --port 1235`),
            delay(3000),
            switchMap(proc => of(undefined).pipe(
                // test app starts
                switchMap(() => openBrowser({url: 'http://localhost:1235'})),
                switchMap(page => page.waitForSelector('text=Reach')),
                switchMap(() => proc.kill()),
            ))
        ))
    )
 });