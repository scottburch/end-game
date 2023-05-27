import {GraphWithP2p, P2pMsg} from "./p2pHandlers.js";
import WS from "isomorphic-ws";
import WebSocket from "isomorphic-ws";
import {delay, filter, first, fromEvent, map, mergeMap, of, skipWhile, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";
import {GraphId, LogLevel} from "@end-game/graph";


export type PeerConn = {
    socket: WebSocket,
    close: () => void
}

type AnnounceMsg = P2pMsg<'announce', {graphId: GraphId}>

export const socketManager = (graph: GraphWithP2p, peerConn: PeerConn) => {
    const isDup = dupCache(peerConn.socket);
    let connOk = false;

    peerConn.socket.send(serializer({
        cmd: 'announce',
        data: {
            graphId: graph.graphId
        }
    } satisfies AnnounceMsg))

    graph.chains.peersOut.pipe(
        skipWhile(() => !connOk),
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
        tap(msg => msg.cmd === 'announce' && checkDupConn(msg as AnnounceMsg)),
        skipWhile(() => !connOk),
        mergeMap(msg => chainNext(graph.chains.peerIn, {graph, msg})),
    );

    function checkDupConn(msg: AnnounceMsg) {
        if(graph.peerConnections.has(msg.data.graphId)) {
            peerConn.close();
            chainNext(graph.chains.log, {
                graph,
                item: {
                    code: 'DUPLICATE_CONNECTION',
                    text: 'Duplicate connection to ' + msg.data.graphId,
                    level: LogLevel.INFO
                }
            }).subscribe()
        } else {
            graph.peerConnections.add(msg.data.graphId);
            connOk = true;
        }
    }
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



