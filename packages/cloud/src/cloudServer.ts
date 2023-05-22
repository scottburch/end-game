import {fromEvent, map, mergeMap, Observable, of, Subject, switchMap, tap} from "rxjs";
import type {Graph, GraphEdge, GraphNode, NodeId, Props} from "@end-game/graph";
import WS from "isomorphic-ws";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {graphGet, graphPutEdge, graphPutNode} from "@end-game/graph";
import type {ClientMsg, PutNodeClientMsg} from "./cloudClient.js";



export type CloudServerOpts = {
    port: number
}

export const cloudServerHandlers = (graph: Graph, opts: CloudServerOpts) => of(graph).pipe(
    switchMap(graph => startServer(graph, opts.port))
);




export const startServer = (graph: Graph, port: number) => new Observable<Graph>(subscriber => {
    const wss = new WS.WebSocketServer({port});
    const serverSub = of(wss).pipe(
        switchMap(wss => fromEvent(wss, 'listening').pipe(map(() => wss))),
        mergeMap(wss => fromEvent(wss, 'connection').pipe(
            map(x => (x as [WS.WebSocket])[0]),
            mergeMap(conn => listener(graph, conn))
        )),
    ).subscribe();

    subscriber.next(graph);

    return () => {
        serverSub.unsubscribe();
        Array.from(wss.clients.values()).forEach(client => client.close());
        wss.close();
    };
});

const listener = (graph: Graph, conn: WS.WebSocket) => {
    const sub = new Subject<ClientMsg<string, any>>();

    sub.pipe(
        map(msg => serializer(msg)),
        tap(msg => conn.send(msg))
    )

    return fromEvent<MessageEvent>(conn, 'message').pipe(
        map(ev => deserializer(ev.data)),
        mergeMap(({cmd, data}) => fns[cmd](graph, data, sub)),
    );
}

const fns: Record<string, (graph: Graph, data: any, client: Subject<ClientMsg<string, any>>) => Observable<any>> = {
    putNode: (graph, data: GraphNode<Props>) =>
        graphPutNode(graph, data),
    putEdge: (graph: Graph, data: GraphEdge<Props>) =>
        graphPutEdge(graph, data),
    getNode: (graph: Graph, data: NodeId, client) =>
        graphGet(graph, data).pipe(
            tap(({node}) => client.next({cmd: 'putNode', data:node} satisfies PutNodeClientMsg))
        )

}


