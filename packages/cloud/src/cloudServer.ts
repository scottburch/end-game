import {fromEvent, map, mergeMap, Observable, of, switchMap, tap} from "rxjs";
import type {Graph} from "@end-game/graph";
import WS from "isomorphic-ws";
import {insertHandlerAfter} from "@end-game/rxjs-chain";
import type {GraphHandler} from "@end-game/graph";


export type CloudServerOpts = {
    port: number
}

export const cloudServerHandlers = (graph: Graph, opts: CloudServerOpts) => of(graph).pipe(
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'cloud', cloudPutPostHandler)),
    switchMap(graph => startServer(graph, opts.port))
);

const cloudPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => of({graph, node});



export const startServer = (graph: Graph, port: number) => new Observable<Graph>(subscriber => {
    const wss = new WS.WebSocketServer({port});
    const serverSub = of(wss).pipe(
        switchMap(wss => fromEvent(wss, 'listening').pipe(map(() => wss))),
        // observe when a client connects
        mergeMap(wss => fromEvent(wss, 'connection').pipe(
            map(x => (x as [WS.WebSocket])[0]),
            switchMap(conn => listener(graph, conn))
        )),
    ).subscribe();

    subscriber.next(graph);

    return () => {
        serverSub.unsubscribe();
        Array.from(wss.clients.values()).forEach(client => client.close());
        wss.close();
    };
});

const listener = (graph: Graph, conn: WS.WebSocket) =>
    fromEvent(conn, 'data').pipe(
        tap(x => x)
    );

