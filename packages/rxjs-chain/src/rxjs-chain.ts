import type {Subscriber} from 'rxjs'
import {concatMap, defaultIfEmpty, from, last, map, mergeMap, Observable, of, switchMap, takeWhile, tap} from "rxjs";


export type RxjsChainFn<T> = (v: T) => Observable<T>
export type RxjsChainFilterFn<T> = (chain: RxjsChain<T>, handler: string, val: T) => Observable<boolean>

export type RxjsChain<T> = Observable<T> & {
    name: string
    fns: [string, RxjsChainFn<T>][]
    subscribers: Set<Subscriber<T>>
    logger: (fnName: string, v: any) => void
    type: T
    filters: RxjsChainFilterFn<T>[]
};

export type NewChainOpts<T> = {
    name: string
    logger?: (fnName: string, fn: RxjsChainFn<T>) => void
}

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
    const runFilters = (chain: RxjsChain<T>, name: string, val: T) => {
        let result: boolean = true;
        return from(chain.filters).pipe(
            concatMap(fn => fn(chain, name, val)),
            tap(isPass => result = isPass),
            takeWhile(result => result === true),
            defaultIfEmpty({pass: result, val}),
            last(),
            map(() => ({pass: result, val}))
        )
    }

    const generateChain = () =>
        chain.fns.reduce((o, [name, fn]) => o.pipe(
            tap(val => chain.logger(name, val)),
            mergeMap(val => runFilters(chain, name, val).pipe(
                switchMap(({val, pass}) =>
                    pass ? fn(val) : of(val)
                )
            ))
        ), of(val))

    return generateChain().pipe(
        tap(v => chain.logger('chain-out', v)),
        tap(v => chain.subscribers.forEach(subscriber => subscriber.next(v)))
    );
};

export const newRxjsChain = <T>(opts: NewChainOpts<T>) => {
    const o = new Observable<T>(sub => {
        o.subscribers.add(sub);
        return () => o.subscribers.delete(sub);
    }) as RxjsChain<T>;

    o.logger = opts.logger || (() => {});
    o.subscribers = new Set<Subscriber<T>>();
    o.fns = [];
    o.filters = [];
    o.name = opts.name
    return o;
};

export const addChainFilter = <T>(chain: RxjsChain<T>, fn: RxjsChainFilterFn<T>) => {
    chain.filters.push(fn);
    return chain;
}


