import {PistolGraphValue} from "../graph/pistolGraph.js";

export type Cache<T extends PistolGraphValue> = Map<string, {value: T, timestamp: number}>;
export const newCache = <T extends PistolGraphValue>() => new Map<string, {value: T, timestamp: number}>();

export const cacheSet = <T extends PistolGraphValue>(cache: Cache<T>, key: string, value: T) =>
    cache.set(key, {value, timestamp: Date.now()})

export const cacheGet = <T extends PistolGraphValue>(cache: Cache<T>, key: string) => ({
    value: cache.get(key)?.value,
    cache
});

export const cacheDelete = (cache: Cache<any>, key: string) => {
    cache.delete(key);
    return cache;
}

export const cacheRemoveOld = (cache: Cache<any>, ageInMs: number) =>  {
    const old = Date.now() - ageInMs;
    cache.forEach((v, k) => v.timestamp < old && cache.delete(k));
    return cache;
};

