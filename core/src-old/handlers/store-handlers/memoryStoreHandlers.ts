import {catchError, map, mergeMap, of, throwError} from "rxjs";
import {MemoryLevel} from "memory-level";
import {Endgame} from "../../app/endgame.js";
import {HandlerFn} from "../../app/endgameConfig.js";

const stores: Record<string, MemoryLevel> = {};

const getStore = (endgame: Endgame) => stores[endgame.id] = stores[endgame.id] || new MemoryLevel();


export const memoryStoreGetHandler: HandlerFn<'get'> =
    ({endgame, path}) => of(getStore(endgame)).pipe(
        mergeMap(store => store.get(path)),
        map(value => ({endgame, path, value: JSON.parse(value).d})),
        catchError(err => err.notFound ? of({endgame, path, value: undefined}) : throwError(err))
    );

export const memoryStorePutHandler: HandlerFn<'put'> =
    ({endgame, path, value, meta}) => of(getStore(endgame)).pipe(
        mergeMap(store => store.put(path, JSON.stringify({d: value, m: meta}))),
        map(() => ({endgame, value, path, meta}))
    );

export const memoryStoreGetMetaHandler: HandlerFn<'getMeta'> = ({endgame, path}) => of(getStore(endgame)).pipe(
    mergeMap(store => store.get(path)),
    map(value => ({endgame, path, meta: JSON.parse(value).m}))
);

export const memoryStoreRulePutHandler: HandlerFn<'rulePut'> =
    ({endgame, rule, path}) => of(getStore(endgame)).pipe(
        mergeMap(store => store.put(path, JSON.stringify(rule))),
        map(() => ({endgame, rule, path}))
    );

export const memoryStoreRuleGetHandler: HandlerFn<'ruleGet'> =
    ({endgame, path}) => of(getStore(endgame)).pipe(
        mergeMap(store => store.get(path)),
        map(json => ({endgame, rule: JSON.parse(json), path}))
    )



