import {catchError, map, mergeMap, of, switchMap, throwError} from "rxjs";
import {MemoryLevel} from "memory-level";
import {Endgame} from "../app/endgame.js";
import {handlers} from "./handlers.js";

const stores: Record<string, MemoryLevel> = {};

const getStore = (endgame: Endgame) => stores[endgame.id] = stores[endgame.id] || new MemoryLevel();



export const memoryStoreGetHandler = () =>
    handlers<'get'>([({endgame, path}) => of(getStore(endgame)).pipe(
        switchMap(store => store.get(path)),
        map(value => ({endgame, path, value: JSON.parse(value).d})),
        catchError(err => err.notFound ? of({endgame, path, value: undefined}) : throwError(err))
    )]);

export const memoryStorePutHandler = () =>
    handlers<'put'>([({endgame, path, value, meta}) => of(getStore(endgame)).pipe(
        mergeMap(store => store.put(path, JSON.stringify({d: value, m: meta}))),
        map(() => ({endgame, value, path, meta}))
    )]);

export const memoryStoreGetMetaHandler = () =>
    handlers<'getMeta'>([({endgame, path}) => of(getStore(endgame)).pipe(
        switchMap(store => store.get(path)),
        map(value => ({endgame, path, meta: JSON.parse(value).m}))
    )]);



