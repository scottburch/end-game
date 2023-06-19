import type {Graph} from "@end-game/graph";
import {fromEvent, map, mergeMap, Observable, of, switchMap} from "rxjs";
import WS from "isomorphic-ws";
import {GraphWithP2p, PeerId} from "./p2pHandlers.js";
import {socketManager} from "./socketManager.js";
import {newDialer} from "./dialer.js";


export const startServer = (graph: GraphWithP2p, port: number, peerId: PeerId) => new Observable<Graph>(subscriber => {
    const wss = new WS.WebSocketServer({port});
    const serverSub = of(wss).pipe(
        switchMap(wss => fromEvent(wss, 'listening').pipe(map(() => wss))),
        mergeMap(wss => fromEvent(wss, 'connection').pipe(
            map(x => (x as [WS.WebSocket])[0]),
            mergeMap(conn => socketManager(newDialer(graph, peerId), {
                socket: conn,
                close: () => {}
            }))
        )),
    ).subscribe();

    subscriber.next(graph);

    return () => {
        serverSub.unsubscribe();
        Array.from(wss.clients.values()).forEach(client => client?.close());
        wss?.close();
    };
});

