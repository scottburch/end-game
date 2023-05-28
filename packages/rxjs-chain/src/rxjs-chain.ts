import type {Subscriber} from 'rxjs'
import {mergeMap, Observable, of, tap} from "rxjs";

export type RxjsChainFn<T> = (v: T) => Observable<T>

export type RxjsChain<T> = Observable<T> & {
    fns: [string, RxjsChainFn<T>][],
    subscribers: Set<Subscriber<T>>
    type: T
};

export const appendHandler = <T>(chain: RxjsChain<T>, name: string, fn: RxjsChainFn<T>) =>
    chain.fns = [...chain.fns, [name, fn]];

export const insertHandlerBefore = <T>(chain: RxjsChain<T>, before: string, name: string, fn: RxjsChainFn<T>) => {
    const idx = chain.fns.findIndex(([fnName]) => fnName === before);
    idx === -1 ? appendHandler(chain, name, fn) : chain.fns = [...chain.fns.slice(0, idx), [name, fn], ...chain.fns.slice(idx)]
};

export const insertHandlerAfter = <T>(chain: RxjsChain<T>, after: string, name: string, fn: RxjsChainFn<T>) => {
    const idx = chain.fns.findIndex(([fnName]) => fnName === after);
    idx === -1 ? appendHandler(chain, name, fn) : chain.fns = [...chain.fns.slice(0, idx + 1), [name, fn], ...chain.fns.slice(idx + 1)]
};

export const chainNext = <T>(chain: RxjsChain<T>, val: T) => {
        // TODO - change this so that it runs only once per change to handlers
        // maybe by sticking this in the chain itself.
        const generateChain = () =>
            chain.fns.reduce((o, [_, fn]) => o.pipe(mergeMap(fn)), of(val))

        return generateChain().pipe(
            tap(v => chain.subscribers.forEach(subscriber => subscriber.next(v)))
        );
};

export const newRxjsChain = <T>() => {
    const o = new Observable<T>(sub => {
        o.subscribers.add(sub);
        return () => o.subscribers.delete(sub);
    }) as RxjsChain<T>;

    o.subscribers = new Set<Subscriber<T>>();
    o.fns = [];
    return o;
};
