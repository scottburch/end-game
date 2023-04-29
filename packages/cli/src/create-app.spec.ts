import {delay, firstValueFrom, from, map, of, switchMap, tap} from "rxjs";
import {$, cd} from 'zx'
import {newBrowser} from "@end-game/react-graph";



describe('create app', function()  {
    this.timeout(40_000);
   it('should create a working demo app', () =>
        firstValueFrom(from($`yarn build`).pipe(
            switchMap(() => of(true).pipe(
                // setup app
                switchMap(() => $`npm uninstall -g @end-game/cli`),
                switchMap(() => $`npm install -g .`),
                switchMap(() => $`rm -rf /tmp/endgame-test`),
                switchMap(() => $`mkdir /tmp/endgame-test`),
                tap(() => cd('/tmp/endgame-test')),
                switchMap(() => $`endgame create-app my-app`),
                tap(() => cd('/tmp/endgame-test/my-app')),
                map(() => $`yarn dev`),
            )),
            delay(1000),
            switchMap(proc => of(true).pipe(
                // test app starts
                switchMap(() => newBrowser()),
                switchMap(page => page.waitForSelector('text=Task:')),
                tap(() => proc.kill())
            ))
        ))
   )
});