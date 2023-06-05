import {delay, from, map, of, switchMap, tap} from "rxjs";
import * as tar from 'tar'
import {CreateOptions} from "tar";
import {createWriteStream} from "fs";
import {mkdir} from "fs/promises";
import {$} from "zx";
import {absPath} from "@end-game/utils/absPath";





of(true).pipe(
    delay(0),
    tap(() => console.log("tar up the templates")),
    switchMap(() => tarTemplate()),
    tap(() => console.log('build cli')),
    switchMap(() => $`yarn tsc`),
).subscribe(() => console.log('done'));

const tarTemplate = () =>
    from(mkdir(absPath(import.meta.url, '../../templates'), {recursive: true})).pipe(
        map(() => ({
            opts: {
                gzip: true,
                filter: (path) => !/node_modules/.test(path),
                cwd: absPath(import.meta.url, '../../../dtg-templates/dtg-ts-template')
            } satisfies CreateOptions,
            files: ['.']
        })),
        tap(({
                 opts,
                 files
             }) => tar.c(opts, files).pipe(createWriteStream(absPath(import.meta.url, '../../templates/dtg-ts-template.tgz')))),
    );