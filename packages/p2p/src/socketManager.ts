import {GraphWithP2p, P2pMsg} from "./p2pHandlers.js";
import WS from "isomorphic-ws";
import {delay, filter, first, fromEvent, map, mergeMap, of, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";


export const socketManager = (graph: GraphWithP2p, conn: WS.WebSocket) => {
    const isDup = dupCache(conn);

    graph.chains.peersOut.pipe(
        takeUntil(fromEvent(conn, 'close').pipe(first())),
        map(({msg}) => serializer(msg)),
        filter(msg => !isDup(msg)),
        tap(msg => conn.send(msg))
    ).subscribe();

    return fromEvent<MessageEvent>(conn, 'message').pipe(
        map(ev => ev.data),
        filter(msg => !isDup(msg)),
        map(msg => deserializer<P2pMsg>(msg)),
        mergeMap(msg => chainNext(graph.chains.peerIn, {graph, msg})),
    );
}

const dupCache = (conn: WS.WebSocket, timeout: number = 5000) => {

    const cache = new Set<string>();
    return (key: string) => {
        const exists = cache.has(key);
        exists || cache.add(key);
        of(key).pipe(
            delay(5000),
            takeUntil(fromEvent(conn, 'close')),
            tap(() => cache.delete(key))
        ).subscribe()
        return exists;
    }
}



