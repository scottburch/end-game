import {Graph} from "@end-game/graph";
import {first, fromEvent, Observable, switchMap, tap} from "rxjs";
import WebSocket from "isomorphic-ws";
import {GraphWithP2p} from "./p2pHandlers.js";
import {PeerConn, socketManager} from "./socketManager.js";

export type DialerOpts = {
    url: string
    redialInterval?: number
}

export type Dialer = {
    graph: GraphWithP2p
}

export const newDialer = (graph: GraphWithP2p) => ({graph});

export const dialPeer = (dialer: Dialer, opts: DialerOpts) =>
    new Observable<{graph: Graph}>(subscriber => {
        let stopping = false;
        let peerConn: PeerConn;
        setTimeout(() => dial());


        const dial = () => {
            peerConn = {
                socket: new WebSocket(opts.url),
                close: () => {
                    stopping = true;
                    peerConn.socket?.close();
                }};

            const openSub = fromEvent<WebSocket.Event>(peerConn.socket, 'open').pipe(
                switchMap(() => socketManager(dialer.graph, peerConn))
            ).subscribe();

            const closeSub = fromEvent<WebSocket.CloseEvent>(peerConn.socket, 'close').pipe(
                tap(() => {
                    openSub.unsubscribe();
                    errorSub.unsubscribe();
                    closeSub.unsubscribe();
                    stopping || redial();
                }),
                first()
            ).subscribe()

            const errorSub = fromEvent<ErrorEvent>(peerConn.socket, 'error').pipe(
                tap(() => peerConn.socket?.close())
            ).subscribe()
        };

        const redial = () => setTimeout(dial, (opts.redialInterval || 30) * 1000);

        subscriber.next({graph: dialer.graph});

        return () => peerConn?.close()
    });
