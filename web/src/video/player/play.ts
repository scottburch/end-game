import {first, map, Observable, of, switchMap, tap} from "rxjs";

// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'
import {getSpeaker, speakerLoad, speakerPlay} from "./speak.js";


export const playSvg = <T extends string | number>(start: T, end: T) => of(true).pipe(
    map(() => KeyshapeJS.timelines()[0]),
    tap(tl => tl.range(start ? start : tl.range().out, end)),
    tap(tl => tl.play()),
    switchMap(tl => new Observable(sub =>
        tl.onfinish = () => sub.next()
    )),
    first()
);

export const playFile = (filename: string) =>
    getSpeaker().pipe(
        switchMap(speaker => speakerLoad(speaker, filename)),
        switchMap(speaker => speakerPlay(speaker))
    );