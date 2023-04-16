import {Observable, Subject} from "rxjs";
import {AuthenticatedEndgame, Endgame, LogEntry} from "./endgame.js";
import {PeerMsg} from "../p2p/peerMsg.js";
import {getNetworkTime, EndgameGraphBundle, EndgameGraphValue, EndgameGraphMeta} from "../graph/endgameGraph.js";

export type ChainPair<T> = Observable<T> & {next: (v: T) => void, props: T}
export type ChainProps<T extends keyof EndgameConfig['chains']> = EndgameConfig['chains'][T]['props']

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
        log: config.chains?.log || nullChainPair<ChainProps<'log'>>(),
        peerConnect: config.chains?.peerConnect || nullChainPair<ChainProps<'peerConnect'>>(),
        auth: config.chains?.auth || nullChainPair<ChainProps<'auth'>>(),
        unauth: config.chains?.unauth || nullChainPair<ChainProps<'unauth'>>(),
        peersOut: config.chains?.peersOut || nullChainPair<ChainProps<'peersOut'>>(),
        peerIn: config.chains?.peerIn || nullChainPair<ChainProps<'peerIn'>>(),
        put: config.chains?.put || nullChainPair<ChainProps<'put'>>(),
        get: config.chains?.get || nullChainPair<ChainProps<'get'>>(),
        getMeta: config.chains?.getMeta || nullChainPair<ChainProps<'getMeta'>>()
    }

} satisfies EndgameConfig as EndgameConfig)

export const nullChainPair = <T>() => {
    const subject = new Subject<T>();
    const observable = subject.asObservable() as ChainPair<T>;
    observable.next = (v: T) => subject.next(v);
    return observable;
};

