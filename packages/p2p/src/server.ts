import type {Graph} from "@end-game/graph";
import {first, fromEvent, map, mergeMap, Observable, of, Subject, switchMap, takeUntil, tap} from "rxjs";
import WS from "isomorphic-ws";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";
import {GraphWithP2p, P2pMsg} from "./p2pHandlers.js";
import {socketManager} from "./socketManager.js";

export const startServer = (graph: GraphWithP2p, port: number) => new Observable<Graph>(subscriber => {
    const wss = new WS.WebSocketServer({port});
    const serverSub = of(wss).pipe(
        switchMap(wss => fromEvent(wss, 'listening').pipe(map(() => wss))),
        mergeMap(wss => fromEvent(wss, 'connection').pipe(
            map(x => (x as [WS.WebSocket])[0]),
            mergeMap(conn => socketManager(graph, conn))
        )),
    ).subscribe();

    subscriber.next(graph);

    return () => {
        serverSub.unsubscribe();
        Array.from(wss.clients.values()).forEach(client => client.close());
        wss.close();
    };
});

