import {Graph} from "@end-game/graph";
import {fromEvent, map, Observable, tap} from "rxjs";
import WebSocket from "isomorphic-ws";
import {deserializer, serializer} from "@end-game/utils/serializer";
import {GraphWithP2p, P2pMsg} from "./p2pHandlers.js";
import {chainNext} from "@end-game/rxjs-chain";
import {socketManager} from "./socketManager.js";

export type DialerOpts = {
    url: string
}

export const dialPeer = (graph: Graph, opts: DialerOpts) =>
    new Observable<{graph: Graph}>(subscriber => {
        const socket = new WebSocket(opts.url);

        const socketManagerSub = socketManager(graph as GraphWithP2p, socket).subscribe()



        subscriber.next({graph});

        return () => {
            socketManagerSub.unsubscribe()
            socket.close();
        }

    })
