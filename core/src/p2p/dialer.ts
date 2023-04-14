import {filter,  interval, map, merge, mergeMap, Observable, of, tap, timer} from "rxjs";
import {DupConnMsg, newPeerMsg, PeerAnnounceMsg, PeerMsg} from "./peerMsg.js";
import {PeerConnection} from "./connectionManager.js";
import {cacheSet} from "../common/cache.js";

const checkForDuplicateConnection = (peerConn: PeerConnection, msg: PeerAnnounceMsg) => of(msg).pipe(
    filter(msg => msg.cmd === 'announce'),
    filter(msg => msg.from.split('-')[1] < peerConn.pistol.id.split('-')[1]),
    map(msg => msg.payload.peerId),
    map(() => ({isDup: false, peerId: 0})),
    // switchMap(peerId => peerConn.pistol.connectionManager.isDuplicateConnection(peerId, peerConn).pipe(
    //     map(isDup => ({peerId, isDup}))
    // )),
    filter(({isDup}) => isDup),
    tap(({peerId}) => peerConn.side === 'server' ? (
        sendToPeer(peerConn, newPeerMsg<DupConnMsg>(peerConn.pistol, {
            cmd: 'dup-connection',
            forward: false,
            payload: {},
        })).subscribe()
    ) : peerConn.closeConn(peerConn.conn)),
    tap(() => peerConn.pistol.config.chains.log.next({
        module: 'dialer',
        level: 'info',
        code: 'DUPLICATE_CONNECTION',
        data: {peerId: msg.payload.peerId},
        time: new Date().toISOString()
    })),
    map(() => msg as PeerMsg<any, any>)
);

export const checkForDuplicateConnectionNotification = (peerConn: PeerConnection, msg: DupConnMsg) => of(msg).pipe(
    filter(() => msg.cmd === 'dup-connection'),
    tap(() => peerConn.closeConn(peerConn.conn))
);
export const handleMessageReceived = (peerConn: PeerConnection, msg: string) => of(msg).pipe(
    tap(json => cacheSet(peerConn.dupCache, json, '')),
    map(json => JSON.parse(json) as PeerMsg<any, any>),
    tap(msg => peerConn.pistol.config.chains.peerIn.next({pistol: peerConn.pistol, msg})),
    tap(msg => checkForDuplicateConnection(peerConn, msg).subscribe()),
    tap(msg => checkForDuplicateConnectionNotification(peerConn, msg).subscribe())
);


export const startPeerAnnouncer = (peerConn: PeerConnection) => new Observable<PeerConnection>(observer => {
    const sub = merge(timer(1), interval(30_000)).pipe(
        mergeMap(() => sendToPeer<PeerAnnounceMsg>(
            peerConn,
            newPeerMsg<PeerAnnounceMsg>(peerConn.pistol, {
                cmd: 'announce',
                payload: {
                    peerId: peerConn.pistol.id
                },
                forward: false
            })
        )),
    ).subscribe();

    observer.next(peerConn);

    return () => sub.unsubscribe();
});


const sendToPeer = <T extends PeerMsg<any, any>>(peerConn: PeerConnection, msg: T) =>
    of(msg).pipe(
        map(msg => JSON.stringify(msg)),
        tap(json => peerConn.data.next(json))
    )

export const startPeerMsgBroadcaster = (peerConn: PeerConnection) => new Observable<PeerConnection>(observer => {
    const sub = peerConn.pistol.config.chains.peersOut.pipe(
        map(msg => JSON.stringify(msg)),
        filter((json) => !peerConn.dupCache.has(json)),
        tap(json => cacheSet(peerConn.dupCache, json, '')),
        tap(msg => peerConn.data.next(msg))
    ).subscribe();

    observer.next(peerConn)

    return () =>
        sub.unsubscribe();
});


