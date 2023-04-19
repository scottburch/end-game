import {HandlerNames, Handler, HandlerProps, HandlerFn} from "../app/endgameConfig.js";
import {mergeMap, of, Subject} from "rxjs";

export const handlers = <T extends HandlerNames>(fns: HandlerFn<T>[]) => {

    const subject = new Subject<HandlerProps<T>>();
    const observer = fns.reduce((o, fn) => {
        return o.pipe(
            mergeMap(fn)
        )
    },subject.asObservable()) as Handler<HandlerProps<T>>
    observer.next = (v: HandlerProps<T>) => {
        subject.next(v);
        return fns.reduce((o, fn) => {
            return o.pipe(
                mergeMap(fn)
            )
        }, of(v))
    };
    return observer
};
export const nullHandler = <T extends HandlerNames>() =>
    handlers<T>([(x: HandlerProps<T>) => of(x)]);


