import {fromEvent, map, mergeMap, Observable, of, switchMap} from "rxjs";
import WS from "isomorphic-ws";
import {socketManager} from "./socketManager.js";
import {Host} from "./host.js";


export const startServer = (host: Host) => new Observable<Host>(subscriber => {
    const wss = new WS.WebSocketServer({port: host.listeningPort});
    const serverSub = of(wss).pipe(
        switchMap(wss => fromEvent(wss, 'listening').pipe(map(() => wss))),
        mergeMap(wss => fromEvent(wss, 'connection').pipe(
            map(x => (x as [WS.WebSocket])[0]),
            mergeMap(conn => socketManager(host, {
                socket: conn,
                close: () => {}
            }))
        )),
    ).subscribe();

    subscriber.next(host);

    return () => {
        serverSub.unsubscribe();
        Array.from(wss.clients.values()).forEach(client => client?.close());
        wss?.close();
    };
});

