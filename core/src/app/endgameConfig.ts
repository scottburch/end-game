import {Observable} from "rxjs";
import {AuthenticatedEndgame, Endgame, LogEntry} from "./endgame.js";
import {PeerMsg} from "../p2p/peerMsg.js";
import {EndgameGraphBundle, EndgameGraphMeta, EndgameGraphValue} from "../graph/endgameGraph.js";


export type HandlerNames = keyof EndgameConfig['handlers']
export type Handler<T> = Observable<T> & {next: (v: T) => void, props: T};
export type HandlerProps<T extends HandlerNames> = EndgameConfig['handlers'][T]['props'];
export type HandlerFn<T extends HandlerNames> = (p: HandlerProps<T>) => Observable<HandlerProps<T>>;

export type EndgameConfig = {
    id?: string
    name: string
    port: number
    isTrusted: boolean
    remoteWaitTime: number
    handlers: {
        log: Handler<LogEntry<any>>
        peerConnect: Handler<{endgame: Endgame, peerId: string}>
        login: Handler<{endgame: Endgame, username: string, password: string, userPath: string}>
        logout: Handler<{endgame: Endgame}>
        createUser: Handler<{endgame: Endgame, username: string, password: string, userPath: string}>
        peersOut: Handler<{endgame: Endgame, msg: PeerMsg<any, any>}>
        peerIn: Handler<{endgame: Endgame, msg: PeerMsg<any, any>}>
        put: Handler<EndgameGraphBundle<any> & {endgame: AuthenticatedEndgame}>
        get: Handler<{ path: string, value?: EndgameGraphValue, endgame: Endgame }>
        getMeta: Handler<{endgame: Endgame, path: string, meta?: EndgameGraphMeta}>
    }
}


