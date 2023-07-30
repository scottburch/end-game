import {first, Observable, of, switchMap, tap} from "rxjs";

// @ts-ignore
import * as KeyshapeJS from 'keyshapejs'


export const playSvg = <T extends string | number>(start: T, end: T) => of(KeyshapeJS.timelines()[0]).pipe(
    tap(tl => tl.range(start, end)),
    tap(tl => tl.play()),
    switchMap(tl => new Observable(sub =>
        tl.onfinish = () => sub.next()
    )),
    first()
);
