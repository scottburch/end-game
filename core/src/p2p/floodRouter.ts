import { Endgame} from "../app/endgame.js";
import {delay, filter, map, mergeMap, Observable, of, switchMap, tap} from "rxjs";
import {checkPeerMsgCache, newPeerMsgCacheFilter, peerMsgCacheInvalidator} from "./peerCache.js";

export const floodRouter = (endgame: Endgame) => new Observable<Endgame>(subscriber => {

    const peerMsgCacheFilter = newPeerMsgCacheFilter();

    const cacheSub = peerMsgCacheInvalidator(peerMsgCacheFilter).subscribe()

    const sub = of(endgame).pipe(
        switchMap(endgame => endgame.config.chains.peerIn),
        filter(({msg}) => msg.forward),
        mergeMap(({msg}) => checkPeerMsgCache(peerMsgCacheFilter, msg)),
        delay(1),
        tap(({msg}) =>endgame.config.chains.peersOut.next({endgame, msg})),
        map(() => endgame)
    ).subscribe();
    subscriber.next(endgame);

    return () => {
        sub.unsubscribe();
        cacheSub.unsubscribe();
    };
})
