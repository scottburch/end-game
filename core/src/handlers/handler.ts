import {ChainPair, ChainProps, EndgameConfig} from "../app/endgameConfig.js";
import {mergeMap, Observable, Subject, switchMap} from "rxjs";

export const handler = <T extends keyof EndgameConfig['chains']>(fn: (p: ChainProps<T>) => Observable<ChainProps<T>>) => {
    const subject = new Subject<ChainProps<T>>();
    const observer = subject.asObservable().pipe(
        mergeMap(fn),
    ) as unknown as ChainPair<ChainProps<T>>;

    observer.next = (v: ChainProps<T>) => subject.next(v);
    return observer
};