import {delay, of, tap} from "rxjs";
import {P2pMsg} from "./dialer.js";
import {GraphId} from "@end-game/graph";
import {serializer} from "@end-game/utils/serializer";

export type DupMsgCache = {
    timeout: number
    cache: Set<string>
}


export const newDupMsgCache = (timeout: number = 5000) => ({
    timeout,
    cache: new Set<string>()
} satisfies DupMsgCache as DupMsgCache);

export const isDupMsg = (dupCache: DupMsgCache, msg: {graphId: GraphId, msg: P2pMsg}) => {
    const strMsg = serializer(msg)
    const exists = dupCache.cache.has(strMsg);
    exists || dupCache.cache.add(strMsg);
    exists || of(msg).pipe(
        delay(dupCache.timeout),
        tap(() => dupCache.cache.delete(strMsg))
    ).subscribe()
    return exists;
}
