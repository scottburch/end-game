import {fromEvent, map, mergeMap, Observable, of, switchMap, tap} from "rxjs";
import WS from "isomorphic-ws";
import {Endgame} from "../app/endgame.js";
import {handleMessageReceived} from "./dialer.js";
import {connectionFactory, PeerConnection} from "./connectionManager.js";



export const startPeersServer = (endgame: Endgame) => new Observable<Endgame>(sub => {
    const wss = new WS.WebSocketServer({port: endgame.config.port});
    const serverSub = of(wss).pipe(
        switchMap(wss => fromEvent(wss, 'listening').pipe(map(() => wss))),
        tap(() => sub.next(endgame)),
        // observe when a client connects
        switchMap(wss => fromEvent(wss, 'connection').pipe(
            map(x => (x as [WS.WebSocket])[0]),
            map(conn => ({ endgame, conn}))
        )),
        mergeMap(({endgame, conn}) => connectionFactory(endgame, conn, closeConn, 'server')),
        mergeMap(conn => startPeerMessageListener(conn)),
    ).subscribe();

    const closeConn = (conn: WS.WebSocket) => {
        conn.close();
        sub.unsubscribe();
    }


    return () => {
        serverSub.unsubscribe();
        Array.from(wss.clients.values()).forEach(client => client.close())
        wss.close();
    };
});


export const startPeerMessageListener = (peerConn: PeerConnection) => new Observable<PeerConnection>(observer => {
     const sub = peerConn.data.pipe(
         mergeMap(msg => handleMessageReceived(peerConn, msg))
     ).subscribe();

     observer.next(peerConn);


     return () => sub.unsubscribe();
});


