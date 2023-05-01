import {$, cd} from "zx";
import {of, switchMap, tap} from "rxjs";

import {endgamePackagesDir} from "@end-game/utils/dirs";

const tmpDir = endgamePackagesDir('tmp')


export const createApp = () =>
    of(true).pipe(
        switchMap(() => $`npm uninstall -g @end-game/cli`),
        switchMap(() => $`npm install -g .`),
        switchMap(() => $`rm -rf ${tmpDir}`),
        switchMap(() => $`mkdir ${tmpDir}`),
        tap(() => cd(tmpDir)),
        switchMap(() => $`endgame create-app my-app`),
        tap(() => cd(tmpDir + '/my-app'))
    );
