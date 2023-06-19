import {PeerId} from "./p2pHandlers.js";
import WebSocket from "isomorphic-ws";
import {delay, filter, first, fromEvent, map, mergeMap, of, skipWhile, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";
import {LogLevel} from "@end-game/graph";
import {Dialer, DialerMsg, P2pMsg} from "./dialer.js";


export type PeerConn = {
    socket: WebSocket,
    close: () => void
}

type AnnounceMsg = P2pMsg<'announce', { peerId: PeerId}>

export const socketManager = (dialer: Dialer, peerConn: PeerConn) => {
    const isDup = dupMsgCache();
    let connOk = false;

    peerConn.socket.send(serializer({
        graphId: '',
        msg: {
            cmd: 'announce',
            data: {
                peerId: dialer.peerId
            }
        }
    } satisfies DialerMsg<AnnounceMsg>))

    dialer.graph.chains.peersOut.pipe(
        skipWhile(() => !connOk),
        takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
        map(({msg}) => serializer({
            graphId: dialer.graph.graphId,
            msg
        } satisfies DialerMsg)),
        filter(msg => !isDup(msg)),
        tap(msg => peerConn.socket.send(msg))
    ).subscribe();

    return fromEvent<MessageEvent>(peerConn.socket, 'message').pipe(
        takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
        map(ev => ev.data),
        filter(msg => !isDup(msg)),
        map(msg => deserializer<DialerMsg<P2pMsg>>(msg)),
        tap(msg => msg.msg.cmd === 'announce' && checkDupConn(msg.msg as AnnounceMsg)),
        skipWhile(() => !connOk),
        mergeMap(msg => chainNext(dialer.graph.chains.peerIn, {graph: dialer.graph, msg: msg.msg})),
    );

    function checkDupConn(msg: AnnounceMsg) {
        dialer.graph.peerConnections.has(msg.data.peerId) ? stopDupConnection() : addNewConnection();

        function stopDupConnection() {
            peerConn?.close();
            chainNext(dialer.graph.chains.log, {
                graph: dialer.graph,
                item: {
                    code: 'DUPLICATE_CONNECTION',
                    text: 'Duplicate connection to ' + msg.data.peerId,
                    level: LogLevel.INFO
                }
            }).subscribe()
        }

        function addNewConnection() {
            chainNext(dialer.graph.chains.log, {
                graph: dialer.graph,
                item: {code: 'NEW_PEER_CONNECTION', text: `New connection`, level: LogLevel.INFO}
            }).subscribe();
            dialer.graph.peerConnections.add(msg.data.peerId);
            chainNext(dialer.graph.chains.reloadGraph, '').subscribe();
            connOk = true;
            fromEvent(peerConn.socket, 'close').pipe(
                tap(() => dialer.graph.peerConnections.delete(msg.data.peerId)),
                first()
            ).subscribe()
        }
    }
}

const dupMsgCache = (timeout: number = 5000) => {
    const cache = new Set<string>();

    return (key: string) => {
        const exists = cache.has(key);
        exists || cache.add(key);
        exists || of(key).pipe(
            delay(timeout),
            tap(() => cache.delete(key))
        ).subscribe()
        return exists;
    }
}



