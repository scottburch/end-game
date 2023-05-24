import {GraphWithP2p, P2pMsg} from "./p2pHandlers.js";
import WS from "isomorphic-ws";
import {first, fromEvent, map, mergeMap, takeUntil, tap} from "rxjs";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {chainNext} from "@end-game/rxjs-chain";

export const socketManager = (graph: GraphWithP2p, conn: WS.WebSocket) => {
    graph.chains.peersOut.pipe(
        takeUntil(fromEvent(conn, 'close').pipe(first())),
        map(({msg}) => serializer(msg)),
        tap(msg => conn.send(msg))
    ).subscribe();


    return fromEvent<MessageEvent>(conn, 'message').pipe(
        map(ev => deserializer<P2pMsg>(ev.data)),
        mergeMap(msg => chainNext(graph.chains.peerIn, {graph, msg})),
    );
}


