import type {Graph, GraphEdge, GraphNode, Props} from "@end-game/graph";
import {graphPutEdge, graphPutNode} from "@end-game/graph";
import {fromEvent, map, mergeMap, Observable, of, Subject, switchMap, tap} from "rxjs";
import WS from "isomorphic-ws";
import {deserializer, serializer} from "@end-game/utils/serializer";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {newRxjsChain} from "@end-game/rxjs-chain";

export type P2pOpts = {
    listeningPort: number
}

type GraphWithP2p = Graph & {
    chains: Graph['chains'] & {
        peerIn: RxjsChain<{ graph: Graph, msg: P2pMsg}>
        peersOut: RxjsChain<{ graph: Graph, msg: P2pMsg}>
    }
}

type P2pMsg<Cmd extends string = string, Data extends Object = Object> = {cmd: Cmd, data: Data};

export const p2pHandlers = (graph: Graph, opts: P2pOpts) => of(graph).pipe(
    tap(graph => (graph as GraphWithP2p).chains.peerIn = (graph as GraphWithP2p).chains.peerIn || newRxjsChain()),
    tap(graph => (graph as GraphWithP2p).chains.peersOut = (graph as GraphWithP2p).chains.peersOut || newRxjsChain()),
    switchMap(graph => startServer(graph, opts.listeningPort))
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
    const sub = new Subject<P2pMsg<string, any>>();

    sub.pipe(
        map(msg => serializer(msg)),
        tap(msg => conn.send(msg))
    )

    return fromEvent<MessageEvent>(conn, 'message').pipe(
        map(ev => deserializer(ev.data)),
        mergeMap(({cmd, data}) => fns[cmd](graph, data)),
    );
}

const fns: Record<string, (graph: Graph, data: any) => Observable<any>> = {
    putNode: (graph, data: GraphNode<Props>) =>
        graphPutNode(graph, data),
    putEdge: (graph: Graph, data: GraphEdge<Props>) =>
        graphPutEdge(graph, data),
}


