import {fromEvent, map, Subject, Subscription, tap} from "rxjs";
import WS from "isomorphic-ws";


export class WebsocketWrapperSubject extends Subject<string> {

    conn: WS.WebSocket
    msgSub: Subscription

    constructor(ws: WS.WebSocket) {
        super();
        this.conn = ws;

        this.msgSub = fromEvent<WS.MessageEvent>(this.conn, 'message').pipe(
            map(ev => ev.data),
            map(data => data.toString()),
            tap(v => super.next(v))
        ).subscribe()

    }

    next(value: string) {
        this.conn.send(value);
    }

    unsubscribe() {
        this.msgSub.unsubscribe();
        super.unsubscribe();
    }
}

