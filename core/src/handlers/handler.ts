import {ChainPair, ChainProps, EndgameConfig} from "../app/endgameConfig.js";
import {mergeMap, Observable, Subject, switchMap} from "rxjs";

export const handler = <T extends keyof EndgameConfig['chains']>(fns: [(p: ChainProps<T>) => Observable<ChainProps<T>>]) => {
    const subject = new Subject<ChainProps<T>>();
    const observer = fns.reduce((o, fn) => {
        return o.pipe(
            mergeMap(fn)
        )
    },subject.asObservable()) as unknown as ChainPair<ChainProps<T>>
    observer.next = (v: ChainProps<T>) => subject.next(v);
    return observer
};