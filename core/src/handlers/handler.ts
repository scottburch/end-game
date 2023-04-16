import {ChainPair, ChainProps, EndgameConfig, handlerFn} from "../app/endgameConfig.js";
import {mergeMap, Subject} from "rxjs";

export const handler = <T extends keyof EndgameConfig['chains']>(fns: handlerFn<T>[]) => {
    const subject = new Subject<ChainProps<T>>();
    const observer = fns.reduce((o, fn) => {
        return o.pipe(
            mergeMap(fn)
        )
    },subject.asObservable()) as unknown as ChainPair<ChainProps<T>>
    observer.next = (v: ChainProps<T>) => subject.next(v);
    return observer
};