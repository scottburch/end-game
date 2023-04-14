import {delay, firstValueFrom, map, of, switchMap} from "rxjs";
import {createApp} from "./test/testUtils.js";
import {$} from "zx";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('serve app', () => {
    it('should serve a built app', () =>
        firstValueFrom(createApp().pipe(
            switchMap(() => $`yarn build`),
            map(() => $`yarn serve --port 1235`),
            delay(1000),
            switchMap(proc => of(proc).pipe(
                switchMap(() => openBrowser({port: 1235})),
                switchMap(page => page.waitForSelector('text=Task:')),
                switchMap(() => proc.kill())
            ))
        ))
    );

    it('should serve for a SPA', () =>
        firstValueFrom(createApp().pipe(
            switchMap(() => $`yarn build`),
            map(() => $`yarn serve --port 1235`),
            delay(1000),
            switchMap(proc => of(proc).pipe(
                switchMap(() => openBrowser({port: 1235})),
                switchMap(page => page.goto('http://localhost:1235/somewhere').then(() => page)),
                switchMap(page => page.waitForSelector('text=Task:')),
                switchMap(() => proc.kill())
            ))
        ))
    );

    it('should ignore the query string in the url', () =>
        firstValueFrom(createApp().pipe(
            switchMap(() => $`yarn build`),
            map(() => $`yarn serve --port 1235`),
            delay(1000),
            switchMap(proc => of(proc).pipe(
                switchMap(() => openBrowser({port: 1235})),
                switchMap(page => page.goto('http://localhost:1235/somewhere?with.Query').then(() => page)),
                switchMap(page => page.waitForSelector('text=Task:')),
                switchMap(() => proc.kill())
            ))
        ))
    );

    it('should work with a hash in the url', () =>
        firstValueFrom(createApp().pipe(
            switchMap(() => $`yarn build`),
            map(() => $`yarn serve --port 1235`),
            delay(1000),
            switchMap(proc => of(proc).pipe(
                switchMap(() => openBrowser({port: 1235})),
                switchMap(page => page.goto('http://localhost:1235/somewhere#with.Hash').then(() => page)),
                switchMap(page => page.waitForSelector('text=Task:')),
                switchMap(() => proc.kill())
            ))
        ))
    );

});