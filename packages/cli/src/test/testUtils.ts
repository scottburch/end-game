import {$, cd} from "zx";
import {of, switchMap, tap} from "rxjs";

export const createApp = () =>
    of(true).pipe(
        switchMap(() => $`npm uninstall -g @end-game/cli`),
        switchMap(() => $`npm install -g .`),
        switchMap(() => $`rm -rf /tmp/endgame-test`),
        switchMap(() => $`mkdir /tmp/endgame-test`),
        tap(() => cd('/tmp/endgame-test')),
        switchMap(() => $`endgame create-app my-app`),
        tap(() => cd('/tmp/endgame-test/my-app'))
    );
