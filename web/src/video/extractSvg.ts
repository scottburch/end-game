import {combineLatest, from, map, of, switchMap, tap, toArray} from "rxjs";
import {readFile, writeFile} from 'node:fs/promises'

const IN_FILE = 'endgame-intro/raw.svg';
const OUT_JS = 'endgame-intro/introJS.ts';
const OUT_SVG = 'endgame-intro/introSvg.ts';

from(readFile(IN_FILE)).pipe(
    map(buf => buf.toString()),
    map(str => str.split('\n')),
    map(str => str.join('')),
    switchMap(str => combineLatest([
        of(str).pipe(
            map(str => str.replace(/.*<!\[CDATA\[(.*)\]\]>.*/, '$1')),
            map(js => `${jsTop}${js}}`),
            switchMap(js => writeFile(OUT_JS, js))
        ),
        of(str).pipe(
            map(str => `${svgTop}\`${str}\``),
            switchMap(svg => writeFile(OUT_SVG, svg))
        )
    ]))
).subscribe()


const svgTop = `export const svg = () =>`

const jsTop = `// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'

(global.window as any).ks = KeyshapeJS;
const window = global.window as any;
const document = global.document as any;


export const svgJS = () => {
`