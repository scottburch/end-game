import {$, cd, fs} from "zx";
import {of, switchMap, tap} from "rxjs";
import {endgamePackagesDir} from "@end-game/utils/dirs";
import {absPath} from "@end-game/utils/absPath";

const tmpDir = endgamePackagesDir('tmp')



export const createApp = () =>
    of(true).pipe(
        tap(() => cd(absPath(import.meta.url, '../..'))),
        switchMap(() => $`npm uninstall -g @end-game/cli`),
        switchMap(() => $`npm install -g .`),
        switchMap(() => fs.rm(tmpDir, {recursive: true, force: true})),
        switchMap(() => fs.mkdir(tmpDir)),
        tap(() => cd(tmpDir)),
        switchMap(() => $`endgame create-app my-app`),
        tap(() => cd(tmpDir + '/my-app'))
    );
