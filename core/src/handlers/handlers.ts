import {ChainNames, ChainPair, ChainProps, EndgameConfig, HandlerFn} from "../app/endgameConfig.js";
import {mergeMap, of, Subject} from "rxjs";

export const handlers = <T extends ChainNames>(fns: HandlerFn<T>[]) => {
    const subject = new Subject<ChainProps<T>>();
    const observer = fns.reduce((o, fn) => {
        return o.pipe(
            mergeMap(fn)
        )
    },subject.asObservable()) as unknown as ChainPair<ChainProps<T>>
    observer.next = (v: ChainProps<T>) => subject.next(v);
    return observer
};
export const nullHandler = <T extends ChainNames>() =>
    handlers<T>([(x: ChainProps<T>) => of(x)]);


