import {delay, firstValueFrom, from, map, of, switchMap, tap} from "rxjs";
import {$} from 'zx'
import {newBrowser} from "@end-game/react-graph";
import {createApp} from "./test/testUtils.js";



describe('create app', function()  {
    this.timeout(40_000);
   it('should create a working demo app', () =>
        firstValueFrom(from($`yarn build`).pipe(
            switchMap(() => of(true).pipe(
                switchMap(createApp),
                map(() => $`yarn dev`),
            )),
            delay(2000),
            switchMap(proc => of(true).pipe(
                // test app starts
                switchMap(() => newBrowser()),
                switchMap(page => page.waitForSelector('text=Task:')),
                tap(() => proc.kill())
            ))
        ))
   )
});