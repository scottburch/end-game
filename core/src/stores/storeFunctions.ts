import {GraphStore} from "../graph/graph.js";
import {
    catchError,
    concatMap,
    filter,
    from,
    map,
    mergeMap,
    of, range,
    switchMap, takeWhile,
    tap,
    toArray
} from "rxjs";
import {EndgameKeysOptions} from "../graph/endgameGraph.js";

export const getStoreKeys = (store: GraphStore, base: string, options: EndgameKeysOptions = {}) => {
    return of(options).pipe(
        map(opts => opts.gt ? {...opts, gt: `${base}.${opts.gt}`} satisfies EndgameKeysOptions : opts),
        map(opts => opts.lt ? {...opts, lt: `${base}.${opts.lt}`} satisfies EndgameKeysOptions : opts),
        map(opts => opts.gte ? {...opts, gte: `${base}.${opts.gte}`} satisfies EndgameKeysOptions : opts),
        map(opts => opts.lte ? {...opts, lte: `${base}.${opts.lte}`} satisfies EndgameKeysOptions : opts),
        switchMap(opts => iterateThroughKeys(store, opts))
    );

    function iterateThroughKeys(store: GraphStore, opts: EndgameKeysOptions) {
        return of(store).pipe(
            map(store => ({store, iterator: store.db.keys({...opts, limit: Number.MAX_SAFE_INTEGER})})),
            switchMap(({store, iterator}) => range(1, 10000).pipe(
                map(() => ({store, iterator}))
            )),
            concatMap(({store, iterator}) => iterator.next().then(key => ({key, store, iterator}))),
            takeWhile(({key}) => !!key),
            map(({key}) => key as string),
            filter(isLeaf),
            takeWhile((_, idx) => opts.limit ? idx < opts.limit : true),
            map(removeAncestors),
            toArray()
        );

        function isLeaf(key: string) {
            return new RegExp(`^${base}\.[^\.]*$`).test(key);
        }

        function removeAncestors(key: string) {
            return key.replace(new RegExp(`${base}.([^\.]*).*`), '$1');
        }
    }
};

export const storePut = (store: GraphStore, key: string, value: any) =>
    of(store).pipe(
        mergeMap(store => store.db.put(key, value)),
        map(() => {
        })
    );
export const storeRead = (store: GraphStore, key: string) => from(store.db.get(key)).pipe(
    catchError(err => err.code === 'LEVEL_NOT_FOUND' ? of(undefined) : throwIt(err)),
    tap(x => x)
);
const throwIt = (err: any) => {
    throw err
};