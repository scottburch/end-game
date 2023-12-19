import {delay, of, tap} from "rxjs";

export type DupMsgCache = {
    timeout: number
    cache: Set<string>
}


export const newDupMsgCache = (timeout: number = 5000) => ({
    timeout,
    cache: new Set<string>()
} satisfies DupMsgCache as DupMsgCache);

export const isDupMsg = (dupCache: DupMsgCache, msg: string) => {
    const exists = dupCache.cache.has(msg);
    exists || dupCache.cache.add(msg);
    exists || of(msg).pipe(
        delay(dupCache.timeout),
        tap(() => dupCache.cache.delete(msg))
    ).subscribe()
    return exists;
}
