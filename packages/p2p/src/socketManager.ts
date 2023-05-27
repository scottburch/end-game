import {GraphWithP2p, P2pMsg} from "./p2pHandlers.js";
import WS from "isomorphic-ws";
import {delay, filter, first, fromEvent, map, mergeMap, of, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";
import WebSocket from "isomorphic-ws";


export type PeerConn = {
    socket: WebSocket,
    close: () => void
}

export const socketManager = (graph: GraphWithP2p, peerConn: PeerConn) => {
    const isDup = dupCache(peerConn.socket);

    graph.chains.peersOut.pipe(
        takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
        map(({msg}) => serializer(msg)),
        filter(msg => !isDup(msg)),
        tap(msg => peerConn.socket.send(msg))
    ).subscribe();

    return fromEvent<MessageEvent>(peerConn.socket, 'message').pipe(
        takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
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
        exists || of(key).pipe(
            delay(5000),
            takeUntil(fromEvent(conn, 'close')),
            tap(() => cache.delete(key))
        ).subscribe()
        return exists;
    }
}



