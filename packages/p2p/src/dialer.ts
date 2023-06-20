import {Graph, GraphId} from "@end-game/graph";
import {first, fromEvent, Observable, switchMap, tap} from "rxjs";
import WebSocket from "isomorphic-ws";
import {GraphWithP2p, PeerId} from "./p2pHandlers.js";
import {PeerConn, socketManager} from "./socketManager.js";
import {Host} from "./host.js";

export type DialerOpts = {
    url: string
    redialInterval?: number
}

export type Dialer = {
    graph: GraphWithP2p
    peerId: PeerId
}

export type P2pMsg<Cmd extends string = string, Data extends Object = Object> = {
    cmd: Cmd,
    data: Data
};

export type DialerMsg<T extends P2pMsg = P2pMsg> = {
    graphId: GraphId,
    msg: T
}

export const newDialer = (graph: GraphWithP2p, peerId: PeerId) => ({graph, peerId} satisfies Dialer);

export const dialPeer = (host: Host, opts: DialerOpts) =>
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
                switchMap(() => socketManager(newDialer(host.graphs[0], host.hostId), peerConn))
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

        subscriber.next({graph: host.graphs[0]});

        return () => peerConn?.close()
    });
