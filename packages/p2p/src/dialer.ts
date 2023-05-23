import {Graph} from "@end-game/graph";
import {fromEvent, merge, Observable, switchMap, tap} from "rxjs";
import WebSocket from "isomorphic-ws";
import {GraphWithP2p} from "./p2pHandlers.js";
import {socketManager} from "./socketManager.js";

export type DialerOpts = {
    url: string
    redialInterval?: number
}

export const dialPeer = (graph: Graph, opts: DialerOpts) =>
    new Observable<{graph: Graph}>(subscriber => {
        let stopping = false;
        let socket: WebSocket;
        setTimeout(() => dial());


        const dial = () => {
            socket = new WebSocket(opts.url, {});

            const openSub = fromEvent<WebSocket.Event>(socket, 'open').pipe(
                switchMap(() => merge(
                    socketManager(graph as GraphWithP2p, socket)
                ))
            ).subscribe();

            const closeSub = fromEvent<WebSocket.CloseEvent>(socket, 'close').pipe(
                tap(() => {
                    socket.close();
                    openSub.unsubscribe();
                    errorSub.unsubscribe();
                    closeSub.unsubscribe();
                    stopping || redial()
                })
            ).subscribe()

            const errorSub = fromEvent<ErrorEvent>(socket, 'error').pipe(
                tap(() => socket.close())
            ).subscribe()
        };

        const redial = () => setTimeout(dial, (opts.redialInterval || 30) * 1000);

        subscriber.next({graph});

        return () => {
            stopping = true;
            socket?.close();
        }
    });
