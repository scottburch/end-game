
import {find, from, interval, map, Observable, of, switchMap, tap} from "rxjs";
import WS from "isomorphic-ws";
import {Pistol} from "../app/pistol.js";
import {startPeerAnnouncer, startPeerMsgBroadcaster} from "./dialer.js";
import {WebsocketWrapperSubject} from "./WebsocketWrapperSubject.js";
import {cacheSet, newCache, Cache, cacheRemoveOld} from "../common/cache.js";



export type ConnectionManager = {
    isDuplicateConnection: (peerId: string, peerConn: PeerConnection) => Observable<boolean>
}

export const newConnectionManager = () => {
    const peerIds = newCache();

    // interval(600_000).pipe(
    //     tap(() => cacheRemoveOld(peerIds, 600_000))
    // ).subscribe();

    return {
        isDuplicateConnection: (peerId: string, peerConn: PeerConnection) => of(peerId).pipe(
            map(() => getSessionIdFromPeerId(peerId)),
            switchMap(sessionId => from(peerIds.keys()).pipe(
                find(key => key.startsWith(`${sessionId}-`) && key !== `${sessionId}-${peerConn.id}`),
                map(found => !!found),
                tap(isDup => isDup ? peerIds.delete(`${sessionId}-${peerConn.id}`) : cacheSet(peerIds, `${sessionId}-${peerConn.id}`, 'x')
            ))),
        )
    } satisfies ConnectionManager
}

const getSessionIdFromPeerId = (peerId: string) => peerId.split('-')[1];

export type PeerConnection = {
    id: number
    pistol: Pistol
    conn: WS.WebSocket
    dupCache: Cache<string>
    data: WebsocketWrapperSubject
    closeConn: (ws: WS.WebSocket) => void
    side: 'client' | 'server'
}

export const connectionFactory = (
    pistol: PeerConnection['pistol'],
    conn: PeerConnection['conn'],
    closeConn: PeerConnection['closeConn'],
    side: PeerConnection['side']
) => of<PeerConnection>({
    id: uniqId(),
    pistol,
    conn,
    closeConn,
    dupCache: newCache<string>(),
    //dupCache: new NodeCache({stdTTL: 10, checkperiod: 10}),
    data: new WebsocketWrapperSubject(conn),
    side
}).pipe(
    switchMap(peerConn => startDupCacheCleaner(peerConn)),
    switchMap(conn => startPeerAnnouncer(conn)),
    switchMap((peerConn) => startPeerMsgBroadcaster(peerConn)),
);

const startDupCacheCleaner = (peerConn: PeerConnection) => new Observable<PeerConnection>(observer => {
    const sub = interval(10_000).pipe(
        tap(() => cacheRemoveOld(peerConn.dupCache, 10_000))
    ).subscribe()
    observer.next(peerConn);
    return () => sub.unsubscribe();
});

export const uniqId = (() => {
    let count = 0;
    return () => count++;
})();

