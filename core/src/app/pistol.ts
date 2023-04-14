import {delay, filter, first, merge, of, skipWhile, tap, switchMap, map} from "rxjs";
import {startPeersServer} from "../p2p/networkServer.js";
import {newPeerMsg, PeerMsg} from "../p2p/peerMsg.js";

import {KeyBundle, serializePubKey, signMsg} from "../crypto/crypto.js";
import {getNetworkTime, PistolGraphBundle, PistolGraphMeta, PistolGraphValue} from "../graph/pistolGraph.js";
import {PistolConfig} from "./pistolConfig.js";


export type Pistol = {
    id: string
    config: PistolConfig
};

export type AuthenticatedPistol = Pistol & {
    username: string
    keys: KeyBundle
}

export type PistolLogEntry<T extends Object | undefined> = {
    module: string
    level: 'info' | 'debug' | 'error'
    time: string,
    code: string,
    data?: T
}


export type PistolOpts = Partial<Pistol> & Pick<Pistol, 'config'>;

export const newPistol = (opts: PistolOpts) =>
    of({opts, uid: Math.random().toFixed(10).replace('0.', '')}).pipe(
        map(({opts, uid}) => ({
            ...opts,
            id: opts.id || uid,
        } satisfies Pistol)),
        map(opts => opts as Pistol),
        switchMap(pistol => typeof window === 'undefined' ? startPeersServer(pistol) : of(pistol))
    );



export const getPistolAuthId = (pistol: Pistol) => pistol.id.split('-')[0];

export const pistolAuth = (pistol: Pistol, username: string, password: string, userPath: string) => {
    setTimeout(() => pistol.config.chains.auth.next({pistol, username, password, userPath}))
    return pistol.config.chains.auth.pipe(
        map(({pistol}) => ({pistol: pistol as AuthenticatedPistol}))
    )
}

export const pistolUnAuth = (pistol: AuthenticatedPistol) => {
    setTimeout(() => pistol.config.chains.unauth.next({pistol}));
    return pistol.config.chains.unauth
}

export const pistolPut = <T extends PistolGraphValue, P extends string = string>(pistol: AuthenticatedPistol, path: P, value: T) =>
    serializePubKey(pistol.keys.pubKey).pipe(
        map(owner => ({
            path, value,
            meta: {owner, sig: '', timestamp: getNetworkTime(), perms: 0o744} satisfies PistolGraphMeta
        } satisfies PistolGraphBundle<T>)),
        switchMap(msg => signMsg(pistol, msg)),
        tap(msg =>
            setTimeout(() => pistol.config.chains.put.next({...msg, pistol}))
        ),
        switchMap(() => pistol.config.chains.put),
        skipWhile(msg => msg.path !== path),
        first()
    );

export const pistolGet = <T extends PistolGraphValue, P extends string = string>(pistol: Pistol, path: string) => {
    setTimeout(() => pistol.config.chains.get.next({path, pistol}));
    return pistol.config.chains.get.pipe(
        filter(payload => payload.path === path),
        map(({pistol, value, path}) => ({pistol, value: value as T, path}))
    )
};



export type SendMsgOpts = {
    forward?: boolean
    local?: boolean
}


export const sendMsg = <T extends PeerMsg<any, any>>(pistol: Pistol, cmd: T['cmd'], data: T['payload'], opts: SendMsgOpts = {}) =>
    of(newPeerMsg<PeerMsg<T['cmd'], T['payload']>>(pistol, {
        cmd,
        payload: data,
        forward: opts.forward ?? true
    })).pipe(
        delay(1),
        filter(() => !(opts.local ?? false)),
        tap(msg => pistol.config.chains.peersOut.next({pistol, msg}))
    );

export const pistolTrafficLogger = (() => {
    const start = Date.now();
    const pistols: Pistol[] = []
    return (pistol: Pistol) => of(pistol).pipe(
        tap(() => pistols.push(pistol)),
        switchMap(pistol => merge(
            pistol.config.chains.peersOut.pipe(map(msg => ({
                type: 'peers-out',
                msg
            }))),
            pistol.config.chains.peerIn.pipe(
                map(msg => ({type: 'peer-in', msg}))
            )
        )),
        map(data => ({
            ...data,
            payload: {...data, from: `${findPistolName(data.msg.msg.from)} (${data.msg.msg.from})`}
        })),
        tap(msg => console.log(Date.now() - start, `${pistol.config.name}-${msg.type === 'peer-in' ? 'in' : 'out'}`, `(${pistol.id})`, msg.payload))
    )

    function findPistolName(id: string) {
        return (pistols.find(p => p.id.split('-')[1] === id.split('-')[1]) || {config: {name: 'unknown'}}).config.name
    }
})();

