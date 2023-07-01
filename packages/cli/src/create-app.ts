import {$, cd, fs} from 'zx'
import {from, map, switchMap, tap} from "rxjs";
import {mkdir} from "fs/promises";
import type {ExtractOptions} from "tar";
import * as tar from "tar";
import {absPath} from "@end-game/utils/absPath";

export const createAppCmd = (dest: string) => {
    untarTemplate(dest).pipe(
        tap(() => cd(dest)),
        switchMap(() => $`yarn`),
        tap(() => console.log('\n\n')),
        tap(() => console.log(`You have successfully created a template for ${dest}`)),
        tap(() => console.log('Next steps\n----------')),
        tap(() => console.log(`type "cd ${dest}"`)),
        tap(() => console.log('type "yarn dev" to start the development environment')),
        tap(() => console.log('--------------------------')),
        tap(() => console.log('To run a two node testnet type "endgame testnet"'))
    ).subscribe()
};


const untarTemplate = (dest: string) =>
    from(mkdir(dest)).pipe(
        map(() => ({
            opts: {
                cwd: dest
            } satisfies ExtractOptions,
        })),
        tap(({opts}) => {
            fs.createReadStream(absPath(import.meta.url, '../templates/dtg-ts-template.tgz')).pipe(
                tar.x(opts)
            )
        })
    );

