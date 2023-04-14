import {$, fs} from 'zx'
import {filter, from, last, map, mergeMap, of, switchMap, tap} from "rxjs";

from($`yarn build`).pipe(
    switchMap(() => fs.rm('bundle', {force: true, recursive: true})),
    switchMap(() => fs.copy('lib', 'bundle/lib', {recursive: true})),
    // switchMap(() => removeExt('js')),
    // switchMap(() => removeExt('map')),
    // switchMap(() => $`webpack`),
    switchMap(() => modifyPackageJson()),
    switchMap(() => fs.copy('tsconfig.json', 'bundle/tsconfig.json'))
).subscribe();

const modifyPackageJson = () =>
    of('package.json').pipe(
        switchMap(name => fs.readFile(name)),
        map(buf => buf.toString()),
        map(json => JSON.parse(json)),
        map(obj => ({
            ...obj,
            mocha: undefined,
            devDependencies: undefined,
            scripts: {publishIt: obj.scripts.publishIt},
            exports: {'.': obj.exports['.']}
        })),
        map(obj => JSON.stringify(obj, null, '\t')),
        switchMap(json => fs.writeFile('./bundle/package.json', json, {mode: 0o644}))
    );

const removeExt = (ext: string) =>
    of(ext).pipe(
        switchMap(() => $`find ./bundle -name *.${ext}`),
        map(x => x.stdout),
        map(output => output.split('\n')),
        switchMap(from),
        filter(x => !!x.length),
        mergeMap(file => fs.rm(file)),
        last(),
    )
