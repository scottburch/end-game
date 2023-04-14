import WebSocket from "isomorphic-ws";
import WS from "isomorphic-ws";
import {concatMap, fromEvent, merge, Observable, Subscription, switchMap, tap} from "rxjs";
import {Endgame} from "../app/endgame";
import {handleMessageReceived} from "./dialer";
import {connectionFactory, PeerConnection} from "./connectionManager";

export type DialPeerOpts = {
    redialInterval?: number
}

export const dialPeer = (endgame: Endgame, url: string, opts: DialPeerOpts = {redialInterval: 1}) => new Observable<Endgame>(observer => {
    const redialInterval = opts.redialInterval || 30;
    setTimeout(() => dial());
    let ws: WebSocket;
    let stopping = false;


    function dial() {
        ws = new WebSocket(url);
        let clientSub: Subscription;

        clientSub = merge(
            fromEvent(ws, 'open').pipe(
                concatMap(() => connectionFactory(endgame, ws, closeConn, 'client')),
                concatMap(conn => startPeerMessageListener(conn)),
                tap(conn => conn.endgame.config.handlers.peerConnect.next({endgame, peerId: '0-0'})),
                tap(conn => observer.next(conn.endgame))
            ),
            fromEvent<WS.ErrorEvent>(ws, 'error').pipe(
                tap(ev => endgame.config.handlers.log.next({
                    module: 'networkClient',
                    level: 'error',
                    time: new Date().toISOString(),
                    code: 'NETWORK_ERROR',
                    data: {text: ev.message}
                }))
            ),
            fromEvent<WS.CloseEvent>(ws, 'close').pipe(
                tap(() => setTimeout(() => clientSub?.unsubscribe())),
                tap(() => stopping || setTimeout(dial, redialInterval * 1000))
            )
        ).subscribe();
    }

    const closeConn = (conn: WS.WebSocket) => {
        stopping = true;
        conn.close();
    }

    return () => closeConn(ws);
});

export const startPeerMessageListener = (peerConn: PeerConnection) => new Observable<PeerConnection>(observer => {
    const sub = peerConn.data.pipe(
        switchMap(msg => handleMessageReceived(peerConn, msg))
    ).subscribe();

    observer.next(peerConn);

    return () => sub.unsubscribe();
});

