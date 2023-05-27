import {Graph} from "@end-game/graph";
import {fromEvent, Observable, switchMap, tap} from "rxjs";
import WebSocket from "isomorphic-ws";
import {GraphWithP2p} from "./p2pHandlers.js";
import {PeerConn, socketManager} from "./socketManager.js";

export type DialerOpts = {
    url: string
    redialInterval?: number
}


export const dialPeer = (graph: Graph, opts: DialerOpts) =>
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
                switchMap(() => socketManager(graph as GraphWithP2p, peerConn))
            ).subscribe();

            const closeSub = fromEvent<WebSocket.CloseEvent>(peerConn.socket, 'close').pipe(
                tap(() => {
                    openSub.unsubscribe();
                    errorSub.unsubscribe();
                    closeSub.unsubscribe();
                    stopping || redial();
                })
            ).subscribe()

            const errorSub = fromEvent<ErrorEvent>(peerConn.socket, 'error').pipe(
                tap(() => peerConn.socket.close())
            ).subscribe()
        };

        const redial = () => setTimeout(dial, (opts.redialInterval || 30) * 1000);

        subscriber.next({graph});

        return () => peerConn.close()
    });
