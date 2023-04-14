import { Endgame} from "../app/endgame";
import {delay, filter, map, mergeMap, Observable, of, switchMap, tap} from "rxjs";
import {checkPeerMsgCache, newPeerMsgCacheFilter, peerMsgCacheInvalidator} from "./peerCache";

export const floodRouter = (endgame: Endgame) => new Observable<Endgame>(subscriber => {

    const peerMsgCacheFilter = newPeerMsgCacheFilter();

    const cacheSub = peerMsgCacheInvalidator(peerMsgCacheFilter).subscribe()

    const sub = of(endgame).pipe(
        switchMap(endgame => endgame.config.handlers.peerIn),
        filter(({msg}) => msg.forward),
        mergeMap(({msg}) => checkPeerMsgCache(peerMsgCacheFilter, msg)),
        delay(1),
        tap(({msg}) =>endgame.config.handlers.peersOut.next({endgame, msg})),
        map(() => endgame)
    ).subscribe();
    subscriber.next(endgame);

    return () => {
        sub.unsubscribe();
        cacheSub.unsubscribe();
    };
})
