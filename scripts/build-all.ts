#!/usr/bin/env node --require=ts-node/register   --loader=ts-node/esm    --experimental-specifier-resolution=node
import {$, cd} from 'zx'
import url from "url";
import {bufferCount, concatMap, from, mergeMap, of, switchMap, tap} from "rxjs";

export const absPath = (filename = '.') => url.fileURLToPath(new URL(filename, import.meta.url));

const DIRS = ['rxjs-chain', 'utils', 'crypto', 'graph', 'loggers/console-logger', 'stores/level-store', 'auth/pwd-auth', 'p2p', 'test-utils', 'react-graph', 'dtg-scripts', 'cli', 'graph-explorer'];


of(true).pipe(
    tap(() => cd(absPath('../packages'))),
    switchMap(() => from(DIRS)),
    mergeMap(dir => $`rm -rf .${dir}/lib`),
    bufferCount(DIRS.length),
    switchMap(() => from(DIRS)),
    concatMap(dir => of(dir).pipe(
        tap(dir => console.log('***********', 'building', dir, '*************')),
        tap(() => cd(absPath(`../packages/${dir}`))),
        switchMap(() => $`yarn build`)
    ))
).subscribe();


