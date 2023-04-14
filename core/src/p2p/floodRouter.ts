import { Pistol} from "../app/pistol.js";
import {delay, filter, map, mergeMap, Observable, of, switchMap, tap} from "rxjs";
import {checkPeerMsgCache, newPeerMsgCacheFilter, peerMsgCacheInvalidator} from "./peerCache.js";

export const floodRouter = (pistol: Pistol) => new Observable<Pistol>(subscriber => {

    const peerMsgCacheFilter = newPeerMsgCacheFilter();

    const cacheSub = peerMsgCacheInvalidator(peerMsgCacheFilter).subscribe()

    const sub = of(pistol).pipe(
        switchMap(pistol => pistol.config.chains.peerIn),
        filter(({msg}) => msg.forward),
        mergeMap(({msg}) => checkPeerMsgCache(peerMsgCacheFilter, msg)),
        delay(1),
        tap(({msg}) =>pistol.config.chains.peersOut.next({pistol, msg})),
        map(() => pistol)
    ).subscribe();
    subscriber.next(pistol);

    return () => {
        sub.unsubscribe();
        cacheSub.unsubscribe();
    };
})
