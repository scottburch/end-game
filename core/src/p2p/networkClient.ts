import WebSocket from "isomorphic-ws";
import WS from "isomorphic-ws";
import {concatMap, fromEvent, merge, Observable, Subscription, switchMap, tap} from "rxjs";
import {Pistol} from "../app/pistol.js";
import {handleMessageReceived} from "./dialer.js";
import {connectionFactory, PeerConnection} from "./connectionManager.js";

export type DialPeerOpts = {
    redialInterval?: number
}

export const dialPeer = (pistol: Pistol, url: string, opts: DialPeerOpts = {redialInterval: 1}) => new Observable<Pistol>(observer => {
    const redialInterval = opts.redialInterval || 30;
    setTimeout(() => dial());
    let ws: WebSocket;
    let stopping = false;


    function dial() {
        ws = new WebSocket(url);
        let clientSub: Subscription;

        clientSub = merge(
            fromEvent(ws, 'open').pipe(
                concatMap(() => connectionFactory(pistol, ws, closeConn, 'client')),
                concatMap(conn => startPeerMessageListener(conn)),
                tap(conn => conn.pistol.config.chains.peerConnect.next({pistol, peerId: '0-0'})),
                tap(conn => observer.next(conn.pistol))
            ),
            fromEvent<WS.ErrorEvent>(ws, 'error').pipe(
                tap(ev => pistol.config.chains.log.next({
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

