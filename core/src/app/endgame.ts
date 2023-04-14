import {delay, filter, first, merge, of, skipWhile, tap, switchMap, map} from "rxjs";
import {startPeersServer} from "../p2p/networkServer.js";
import {newPeerMsg, PeerMsg} from "../p2p/peerMsg.js";

import {KeyBundle, serializePubKey, signMsg} from "../crypto/crypto.js";
import {getNetworkTime, EndgameGraphBundle, EndgameGraphMeta, EndgameGraphValue} from "../graph/endgameGraph.js";
import {EndgameConfig} from "./endgameConfig.js";


export type Endgame = {
    id: string
    config: EndgameConfig
};

export type AuthenticatedEndgame = Endgame & {
    username: string
    keys: KeyBundle
}

export type LogEntry<T extends Object | undefined> = {
    module: string
    level: 'info' | 'debug' | 'error'
    time: string,
    code: string,
    data?: T
}


export type EndgameOpts = Partial<Endgame> & Pick<Endgame, 'config'>;

export const newEndgame = (opts: EndgameOpts) =>
    of({opts, uid: Math.random().toFixed(10).replace('0.', '')}).pipe(
        map(({opts, uid}) => ({
            ...opts,
            id: opts.id || uid,
        } satisfies Endgame)),
        map(opts => opts as Endgame),
        switchMap(endgame => typeof window === 'undefined' ? startPeersServer(endgame) : of(endgame))
    );



export const getAuthId = (endgame: Endgame) => endgame.id.split('-')[0];

export const endgameAuth = (endgame: Endgame, username: string, password: string, userPath: string) => {
    setTimeout(() => endgame.config.chains.auth.next({endgame, username, password, userPath}))
    return endgame.config.chains.auth.pipe(
        map(({endgame}) => ({endgame: endgame as AuthenticatedEndgame}))
    )
}

export const endgameUnAuth = (endgame: AuthenticatedEndgame) => {
    setTimeout(() => endgame.config.chains.unauth.next({endgame}));
    return endgame.config.chains.unauth
}

export const endgamePut = <T extends EndgameGraphValue, P extends string = string>(endgame: AuthenticatedEndgame, path: P, value: T) =>
    serializePubKey(endgame.keys.pubKey).pipe(
        map(owner => ({
            path, value,
            meta: {owner, sig: '', timestamp: getNetworkTime(), perms: 0o744} satisfies EndgameGraphMeta
        } satisfies EndgameGraphBundle<T>)),
        switchMap(msg => signMsg(endgame, msg)),
        tap(msg =>
            setTimeout(() => endgame.config.chains.put.next({...msg, endgame}))
        ),
        switchMap(() => endgame.config.chains.put),
        skipWhile(msg => msg.path !== path),
        first()
    );

export const endgameGet = <T extends EndgameGraphValue, P extends string = string>(endgame: Endgame, path: string) => {
    setTimeout(() =>endgame.config.chains.get.next({path, endgame}));
    return endgame.config.chains.get.pipe(
        filter(payload => payload.path === path),
        map(({endgame, value, path}) => ({endgame, value: value as T, path}))
    )
};



export type SendMsgOpts = {
    forward?: boolean
    local?: boolean
}


export const sendMsg = <T extends PeerMsg<any, any>>(endgame: Endgame, cmd: T['cmd'], data: T['payload'], opts: SendMsgOpts = {}) =>
    of(newPeerMsg<PeerMsg<T['cmd'], T['payload']>>(endgame, {
        cmd,
        payload: data,
        forward: opts.forward ?? true
    })).pipe(
        delay(1),
        filter(() => !(opts.local ?? false)),
        tap(msg => endgame.config.chains.peersOut.next({endgame, msg}))
    );

export const trafficLogger = (() => {
    const start = Date.now();
    const endgames: Endgame[] = []
    return (endgame: Endgame) => of(endgame).pipe(
        tap(() => endgames.push(endgame)),
        switchMap(endgame => merge(
            endgame.config.chains.peersOut.pipe(map(msg => ({
                type: 'peers-out',
                msg
            }))),
            endgame.config.chains.peerIn.pipe(
                map(msg => ({type: 'peer-in', msg}))
            )
        )),
        map(data => ({
            ...data,
            payload: {...data, from: `${findEndgameName(data.msg.msg.from)} (${data.msg.msg.from})`}
        })),
        tap(msg => console.log(Date.now() - start, `${endgame.config.name}-${msg.type === 'peer-in' ? 'in' : 'out'}`, `(${endgame.id})`, msg.payload))
    )

    function findEndgameName(id: string) {
        return (endgames.find(p => p.id.split('-')[1] === id.split('-')[1]) || {config: {name: 'unknown'}}).config.name
    }
})();

