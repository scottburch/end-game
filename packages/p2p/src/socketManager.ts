import {GraphWithP2p, PeerId} from "./p2pHandlers.js";
import WebSocket from "isomorphic-ws";
import {filter, first, fromEvent, map, mergeMap, skipWhile, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";
import {GraphId, LogLevel} from "@end-game/graph";
import {DialerMsg, P2pMsg} from "./dialer.js";
import {Host} from "./host.js";
import {DupMsgCache, isDupMsg} from "./dupMsgCache.js";


export type PeerConn = {
    socket: WebSocket
    close: () => void
    dupCache: DupMsgCache
}

type AnnounceMsg = P2pMsg<'announce', { hostId: PeerId}>

export const socketManager = (host: Host, peerConn: PeerConn) => {
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
            filter(msg => !isDupMsg(peerConn.dupCache, msg)),
            tap(msg => peerConn.socket.send(msg))
        ).subscribe()
    )

    return fromEvent<MessageEvent>(peerConn.socket, 'message').pipe(
        takeUntil(fromEvent(peerConn.socket, 'close').pipe(first())),
        map(ev => ev.data),
        filter(msg => !isDupMsg(peerConn.dupCache, msg)),
        map(msg => deserializer<DialerMsg>(msg)),
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


