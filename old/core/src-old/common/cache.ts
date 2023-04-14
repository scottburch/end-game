import {EndgameGraphValue} from "../graph/endgameGraph";

export type Cache<T extends EndgameGraphValue> = Map<string, {value: T, timestamp: number}>;
export const newCache = <T extends EndgameGraphValue>() => new Map<string, {value: T, timestamp: number}>();

export const cacheSet = <T extends EndgameGraphValue>(cache: Cache<T>, key: string, value: T) =>
    cache.set(key, {value, timestamp: Date.now()})

export const cacheGet = <T extends EndgameGraphValue>(cache: Cache<T>, key: string) => ({
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

