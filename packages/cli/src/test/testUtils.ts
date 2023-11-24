import {$, cd, fs} from "zx";
import {of, switchMap, tap} from "rxjs";
import {absPath} from "@end-game/utils/absPath";


export const installCli = () =>
    of(true).pipe(
        tap(() => cd(absPath(import.meta.url, '../..'))),
        switchMap(() => $`npm uninstall -g @end-game/cli`),
        switchMap(() => $`npm install -g .`),
    );

export const createApp = () =>
    installCli().pipe(
        tap(() => cd(absPath(import.meta.url, '../../../../../'))),
        switchMap(() => fs.rm('tmp-test', {recursive: true, force: true})),
        switchMap(() => fs.mkdir('tmp-test')),
        tap(() => cd('tmp-test')),
        switchMap(() => $`endgame create-app my-app`),
        tap(() => cd('my-app'))
    );
