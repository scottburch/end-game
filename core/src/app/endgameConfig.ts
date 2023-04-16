import {Observable} from "rxjs";
import {AuthenticatedEndgame, Endgame, LogEntry} from "./endgame.js";
import {PeerMsg} from "../p2p/peerMsg.js";
import {EndgameGraphBundle, EndgameGraphMeta, EndgameGraphValue, getNetworkTime} from "../graph/endgameGraph.js";
import {nullHandler} from "../handlers/handler.js";

export type ChainPair<T> = Observable<T> & {next: (v: T) => void, props: T};
export type ChainProps<T extends keyof EndgameConfig['chains']> = EndgameConfig['chains'][T]['props'];

export type handlerFn<T extends keyof EndgameConfig['chains']> = (p: ChainProps<T>) => Observable<ChainProps<T>>;

export type EndgameConfig = {
    name: string
    port: number
    isTrusted: boolean
    chains: {
        log: ChainPair<LogEntry<any>>
        peerConnect: ChainPair<{endgame: Endgame, peerId: string}>
        auth: ChainPair<{endgame: Endgame, username: string, password: string, userPath: string}>
        unauth: ChainPair<{endgame: Endgame}>
        peersOut: ChainPair<{endgame: Endgame, msg: PeerMsg<any, any>}>
        peerIn: ChainPair<{endgame: Endgame, msg: PeerMsg<any, any>}>
        put: ChainPair<EndgameGraphBundle<any> & {endgame: AuthenticatedEndgame}>
        get: ChainPair<{ path: string, value?: EndgameGraphValue, endgame: Endgame }>
        getMeta: ChainPair<{endgame: Endgame, path: string, meta?: EndgameGraphMeta}>
    }
}

export const newEndgameConfig = (config: Partial<EndgameConfig>) => ({
    isTrusted: config.isTrusted ?? false,
    name: config.name || `node-${getNetworkTime()}`,
    port: config.port || 11110,
    chains: {
        log: config.chains?.log || nullHandler<'log'>(),
        peerConnect: config.chains?.peerConnect || nullHandler<'peerConnect'>(),
        auth: config.chains?.auth || nullHandler<'auth'>(),
        unauth: config.chains?.unauth || nullHandler<'unauth'>(),
        peersOut: config.chains?.peersOut || nullHandler<'peersOut'>(),
        peerIn: config.chains?.peerIn || nullHandler<'peerIn'>(),
        put: config.chains?.put || nullHandler<'put'>(),
        get: config.chains?.get || nullHandler<'get'>(),
        getMeta: config.chains?.getMeta || nullHandler<'getMeta'>()
    }
} satisfies EndgameConfig as EndgameConfig)

