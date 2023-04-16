import {Observable} from "rxjs";
import {AuthenticatedEndgame, Endgame, LogEntry} from "./endgame.js";
import {PeerMsg} from "../p2p/peerMsg.js";
import {EndgameGraphBundle, EndgameGraphMeta, EndgameGraphValue, getNetworkTime} from "../graph/endgameGraph.js";
import {nullHandler} from "../handlers/handlers.js";

export type HandlerNames = keyof EndgameConfig['handlers']
export type Handler<T> = Observable<T> & {next: (v: T) => void, props: T};
export type HandlerProps<T extends HandlerNames> = EndgameConfig['handlers'][T]['props'];


export type HandlerFn<T extends HandlerNames> = (p: HandlerProps<T>) => Observable<HandlerProps<T>>;

export type EndgameConfig = {
    id?: string
    name: string
    port: number
    isTrusted: boolean
    handlers: {
        log: Handler<LogEntry<any>>
        peerConnect: Handler<{endgame: Endgame, peerId: string}>
        auth: Handler<{endgame: Endgame, username: string, password: string, userPath: string}>
        unauth: Handler<{endgame: Endgame}>
        peersOut: Handler<{endgame: Endgame, msg: PeerMsg<any, any>}>
        peerIn: Handler<{endgame: Endgame, msg: PeerMsg<any, any>}>
        put: Handler<EndgameGraphBundle<any> & {endgame: AuthenticatedEndgame}>
        get: Handler<{ path: string, value?: EndgameGraphValue, endgame: Endgame }>
        getMeta: Handler<{endgame: Endgame, path: string, meta?: EndgameGraphMeta}>
    }
}

export const newEndgameConfig = (config: Partial<EndgameConfig>) => ({
    isTrusted: config.isTrusted ?? false,
    name: config.name || `node-${getNetworkTime()}`,
    port: config.port || 11110,
    handlers: {
        log: config.handlers?.log || nullHandler<'log'>(),
        peerConnect: config.handlers?.peerConnect || nullHandler<'peerConnect'>(),
        auth: config.handlers?.auth || nullHandler<'auth'>(),
        unauth: config.handlers?.unauth || nullHandler<'unauth'>(),
        peersOut: config.handlers?.peersOut || nullHandler<'peersOut'>(),
        peerIn: config.handlers?.peerIn || nullHandler<'peerIn'>(),
        put: config.handlers?.put || nullHandler<'put'>(),
        get: config.handlers?.get || nullHandler<'get'>(),
        getMeta: config.handlers?.getMeta || nullHandler<'getMeta'>()
    }
} satisfies EndgameConfig as EndgameConfig)

