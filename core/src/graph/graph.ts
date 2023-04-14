import {map, Observable, of, switchMap} from "rxjs";
import {PistolGraphValue} from "./pistolGraph.js";
import {AbstractKeyIteratorOptions, AbstractLevel} from 'abstract-level'
import {getStoreKeys, storePut, storeRead} from "../stores/storeFunctions.js";

export type GraphStore = {
    db: AbstractLevel<any, any, any>
};

export const graphReadValue = (store: GraphStore, path: string): Observable<{store: GraphStore, value: PistolGraphValue}> =>
    storeRead(store, path).pipe(
        map(result => result?.d),
        map((value) => ({store, value})),
        switchMap(({store, value}) => typeof value === 'string' && /^@@[^@]/.test(value) ? graphReadValue(store, value.replace(/^@@/, '')) : of({store, value}))
);

export const graphKeys = (store: GraphStore, base: string, options: AbstractKeyIteratorOptions<string> = {}) =>
    getStoreKeys(store, base, options).pipe(
        map(keys => ({store, keys}))
    );

export const graphReadMeta = (store: GraphStore, path: string) =>
    storeRead(store, path).pipe(
        map(result => ({store, meta: result?.m}))
    )

export const graphPut = <D, M>(store: GraphStore, path: string, data: D, meta: M ) =>
    storePut(store, path, {
        d: data,
        m: meta
    }).pipe(
        map(() => ({store}))
    )


