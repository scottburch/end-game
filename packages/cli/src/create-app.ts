import {$, cd, fs} from 'zx'
import {firstValueFrom, from, map, of, switchMap, tap} from "rxjs";
import {mkdir} from "fs/promises";
import type {ExtractOptions} from "tar";
import * as tar from "tar";
import {absPath} from "@end-game/utils";



export const createAppCmd = (dest: string) => {
    untarTemplate(dest).pipe(
        tap(() => console.log('\n\n')),
        tap(() => console.log(`You have successfully created a template for ${dest}`)),
        tap(() => console.log('Next steps\n----------')),
        tap(() => console.log(`type "cd ${dest}"`)),
        tap(() => console.log(`type "yarn start" to start the development environment`)),
//        tap(() => console.log('[optional] type "yarn testnet" to start a two node testnet to use for development')),
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

function doIt(dest: string) {
    return firstValueFrom(of(dest).pipe(
        switchMap(dest => $`git clone https://github.com/scottburch/dds-typescript-template.git ${dest}`),
        tap(() => cd(dest)),
        switchMap(() => fs.rm('.git', {force: true, recursive: true})),
        switchMap(() => $`yarn`),
        tap(() => console.log('\n\n')),
        tap(() => console.log(`You have successfully created a template for ${dest}`)),
        tap(() => console.log('Next steps\n----------')),
        tap(() => console.log(`type "cd ${dest}"`)),
        tap(() => console.log(`type "yarn start" to start the development environment`)),
        tap(() => console.log('[optional] type "yarn testnet" to start a two node testnet to use for development')),
    ))
}
