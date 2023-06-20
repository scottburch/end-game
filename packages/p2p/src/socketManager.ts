import {GraphWithP2p, PeerId} from "./p2pHandlers.js";
import WebSocket from "isomorphic-ws";
import {delay, filter, first, fromEvent, map, mergeMap, of, skipWhile, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";
import {GraphId, LogLevel} from "@end-game/graph";
import {DialerMsg, P2pMsg} from "./dialer.js";
import {Host} from "./host.js";


export type PeerConn = {
    socket: WebSocket,
    close: () => void
}

type AnnounceMsg = P2pMsg<'announce', { hostId: PeerId}>

export const socketManager = (host: Host, peerConn: PeerConn) => {
    const isDup = dupMsgCache();
    let connOk = false;

    const graphTable = host.graphs.reduce((table, graph) => ({
        ...table,
        [graph.graphId]: graph
    }), {} as Record<GraphId, GraphWithP2p>)

    peerConn.socket.send(serializer({
        graphId: '',
        msg: {
            cmd: 'announce',
            data: {
                hostId: host.hostId
            }
        }
    } satisfies DialerMsg<AnnounceMsg>))

    host.graphs.forEach(graph =>
        graph.chains.peersOut.pipe(
            skipWhile(() => !connOk),
            takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
            map(({msg}) => serializer({
                graphId: graph.graphId,
                msg
            } satisfies DialerMsg)),
            filter(msg => !isDup(msg)),
            tap(msg => peerConn.socket.send(msg))
        ).subscribe()
    )

    return fromEvent<MessageEvent>(peerConn.socket, 'message').pipe(
        takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
        map(ev => ev.data),
        filter(msg => !isDup(msg)),
        map(msg => deserializer<DialerMsg<P2pMsg>>(msg)),
        tap(msg => msg.msg.cmd === 'announce' && checkDupConn(msg.msg as AnnounceMsg)),
        skipWhile(() => !connOk),
        filter(msg => !!graphTable[msg.graphId]),
        mergeMap(msg => chainNext(graphTable[msg.graphId].chains.peerIn, {graph: graphTable[msg.graphId], msg: msg.msg})),
    );

    function checkDupConn(msg: AnnounceMsg) {
        // TODO: Move peerConnections to host
        host.peerConnections.has(msg.data.hostId) ? stopDupConnection() : addNewConnection();

        function stopDupConnection() {
            peerConn?.close();
            host.log.next({
                    code: 'DUPLICATE_CONNECTION',
                    text: 'Duplicate connection to ' + msg.data.hostId,
                    level: LogLevel.INFO
            })
        }

        function addNewConnection() {
            host.log.next({code: 'NEW_PEER_CONNECTION', text: `New connection`, level: LogLevel.INFO});
            host.peerConnections.add(msg.data.hostId);
            host.graphs.forEach(graph => chainNext(graph.chains.reloadGraph, '').subscribe())
            connOk = true;
            fromEvent(peerConn.socket, 'close').pipe(
                tap(() => host.peerConnections.delete(msg.data.hostId)),
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



