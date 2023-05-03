import type {Subscriber} from 'rxjs'
import {concatMap, Observable, Subject, tap} from "rxjs";

export type RxjsChainFn<T> = (v: T) => Observable<T>

export type RxjsChain<T> = Observable<T> & {
    fns: [string, RxjsChainFn<T>][],
    next: (v: T) => void,
    appendHandler: (name: string, fn: RxjsChainFn<T>) => void
    insertHandlerBefore: (before: string, name: string, fn: RxjsChainFn<T>) => void
    insertHandlerAfter: (after: string, name: string, fn: RxjsChainFn<T>) => void
    type: T
}

export const newRxjsChain = <T>() => {
    const subscribers = new Set<Subscriber<T>>();
    const o = new Observable<T>(sub => {
        subscribers.add(sub);

        return () => subscribers.delete(sub);
    }) as RxjsChain<T>;

    o.fns = [];

    o.appendHandler = (name: string, fn: RxjsChainFn<T>) =>
        o.fns = [...o.fns, [name, fn]];

    o.insertHandlerBefore = (before: string, name: string, fn: RxjsChainFn<T>) => {
        const idx = o.fns.findIndex(([fnName]) => fnName === before);
        idx === -1 ? o.appendHandler(name, fn) : o.fns = [...o.fns.slice(0, idx), [name, fn], ...o.fns.slice(idx)]
    }

    o.insertHandlerAfter = (after: string, name: string, fn: RxjsChainFn<T>) => {
        const idx = o.fns.findIndex(([fnName]) => fnName === after);
        idx === -1 ? o.appendHandler(name, fn) : o.fns = [...o.fns.slice(0, idx + 1), [name, fn], ...o.fns.slice(idx + 1)]
    }

    // TODO - change this so that it runs only once per change to handlers
    const generateChain = (subject: Subject<T>) =>
        o.fns.reduce((o, [_, fn]) => {
        return o.pipe(concatMap(fn))
    }, subject.asObservable())

    o.next = (val: T) => {
        const subject = new Subject<T>()
        generateChain(subject).pipe(
            tap(v => subscribers.forEach(subscriber => subscriber.next(v))),
        ).subscribe();
        subject.next(val)
    }
    return o;
};
