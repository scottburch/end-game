import {firstValueFrom, switchMap} from "rxjs";
import {createApp} from "./test/testUtils.js";
import {$} from "zx";

describe.skip('build app', () => {
    it('should build an app', () =>
        firstValueFrom(createApp().pipe(
            switchMap(() => $`yarn build`),
        ))
    );
});