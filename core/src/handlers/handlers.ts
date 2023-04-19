import {HandlerNames, Handler, HandlerProps, HandlerFn} from "../app/endgameConfig.js";
import {mergeMap, of, share, Subject} from "rxjs";

export const handlers = <T extends HandlerNames>(fns: HandlerFn<T>[]) => {

    const subject = new Subject<HandlerProps<T>>();
    const observer = fns.reduce((o, fn) => {
        return o.pipe(
            mergeMap(fn)
        )
    },subject.asObservable().pipe(share())) as Handler<HandlerProps<T>>
    observer.next = (v: HandlerProps<T>) => {
        setTimeout(() => subject.next(v));
        return observer;
    };
    return observer
};
export const nullHandler = <T extends HandlerNames>() =>
    handlers<T>([(x: HandlerProps<T>) => of(x)]);



