import {PeerMsg} from "./peerMsg";
import {filter, interval, map, of, tap} from "rxjs";
import {cacheRemoveOld, cacheSet, newCache, Cache} from "../common/cache";


export const newPeerMsgCacheFilter = () => newCache<string>();

export const checkPeerMsgCache = (cache: Cache<string>, msg: PeerMsg<any, any>) =>
    of(msg).pipe(
        map(msg => ({msg, key: JSON.stringify(msg)})),
        filter(({key}) => !cache.has(key)),
        tap(({key}) => cacheSet(cache, key, '')),
        map(() => ({msg}))
    );

export const peerMsgCacheInvalidator = (cache: Cache<string>) =>
    interval(5000).pipe(
        tap(() => cacheRemoveOld(cache, 5000))
    )





