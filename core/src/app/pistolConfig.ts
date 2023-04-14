import {Observable, Subject} from "rxjs";
import {AuthenticatedPistol, Pistol, PistolLogEntry} from "./pistol.js";
import {PeerMsg} from "../p2p/peerMsg.js";
import {getNetworkTime, PistolGraphBundle, PistolGraphValue} from "../graph/pistolGraph.js";

export type ChainPair<T> = Observable<T> & {next: (v: T) => void, props: T}
export type ChainProps<T extends keyof PistolConfig['chains']> = PistolConfig['chains'][T]['props']

export type PistolConfig = {
    name: string
    port: number
    isTrusted: boolean
    chains: {
        log: ChainPair<PistolLogEntry<any>>
        peerConnect: ChainPair<{pistol: Pistol, peerId: string}>
        auth: ChainPair<{pistol: Pistol, username: string, password: string, userPath: string}>
        unauth: ChainPair<{pistol: Pistol}>
        peersOut: ChainPair<{pistol: Pistol, msg: PeerMsg<any, any>}>
        peerIn: ChainPair<{pistol: Pistol, msg: PeerMsg<any, any>}>
        put: ChainPair<PistolGraphBundle<any> & {pistol: AuthenticatedPistol}>
        get: ChainPair<{ path: string, value?: PistolGraphValue, pistol: Pistol }>
    }
}

export const newPistolConfig = (config: Partial<PistolConfig>) => ({
    isTrusted: config.isTrusted ?? false,
    name: config.name || `node-${getNetworkTime()}`,
    port: config.port || 11110,
    chains: {
        log: config.chains?.log || newChainPair<ChainProps<'log'>>(),
        peerConnect: config.chains?.peerConnect || newChainPair<ChainProps<'peerConnect'>>(),
        auth: config.chains?.auth || newChainPair<ChainProps<'auth'>>(),
        unauth: config.chains?.unauth || newChainPair<ChainProps<'unauth'>>(),
        peersOut: config.chains?.peersOut || newChainPair<ChainProps<'peersOut'>>(),
        peerIn: config.chains?.peerIn || newChainPair<ChainProps<'peerIn'>>(),
        put: config.chains?.put || newChainPair<ChainProps<'put'>>(),
        get: config.chains?.get || newChainPair<ChainProps<'get'>>(),
    }

} satisfies PistolConfig as PistolConfig)

export const newChainPair = <T>() => {
    const subject = new Subject<T>();
    const observable = subject.asObservable() as ChainPair<T>;
    observable.next = (v: T) => subject.next(v);
    return observable;
};

