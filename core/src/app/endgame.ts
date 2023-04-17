import {delay, filter, first, merge, of, skipWhile, tap, switchMap, map} from "rxjs";
import {startPeersServer} from "../p2p/networkServer.js";
import {newPeerMsg, PeerMsg} from "../p2p/peerMsg.js";

import {KeyBundle, serializePubKey, signMsg} from "../crypto/crypto.js";
import {getNetworkTime, EndgameGraphBundle, EndgameGraphMeta, EndgameGraphValue} from "../graph/endgameGraph.js";
import {EndgameConfig} from "./endgameConfig.js";
import {nullHandler} from "../handlers/handlers.js";
import {DeepPartial} from "tsdef";


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


export const newEndgame = (config: DeepPartial<EndgameConfig>) =>
    of(newEndgameConfig(config)).pipe(
        map(config => ({
            config,
            id: config.id || Math.random().toFixed(10).replace('0.', ''),
        } satisfies Endgame)),
        map(opts => opts as Endgame),
        // TODO: Move this to handlers maybe.. Somewhere out of here
        switchMap(endgame => typeof window === 'undefined' ? startPeersServer(endgame) : of(endgame))
    );



export const getAuthId = (endgame: Endgame) => endgame.id.split('-')[0];

export const endgameLogin = (endgame: Endgame, username: string, password: string, userPath: string) => {
    setTimeout(() => endgame.config.handlers.login.next({endgame, username, password, userPath}))
    return endgame.config.handlers.login.pipe(
        map(({endgame}) => ({endgame: endgame as AuthenticatedEndgame}))
    )
};

export const endgameCreateUser = (endgame: Endgame, username: string, password: string, userPath: string) => {
    setTimeout(() => endgame.config.handlers.createUser.next({endgame, username, password, userPath}));
    return endgame.config.handlers.createUser.pipe(
        map(({endgame}) => ({endgame: endgame as AuthenticatedEndgame}))
    )
}

export const endgameLogout = (endgame: AuthenticatedEndgame) => {
    setTimeout(() => endgame.config.handlers.logout.next({endgame}));
    return endgame.config.handlers.logout
}

export const endgamePut = <T extends EndgameGraphValue, P extends string = string>(endgame: AuthenticatedEndgame, path: P, value: T) =>
    serializePubKey(endgame.keys.pubKey).pipe(
        map(owner => ({
            path,
            value,
            meta: {owner, sig: '', timestamp: getNetworkTime(), perms: 0o744} satisfies EndgameGraphMeta
        } satisfies EndgameGraphBundle<T>)),
        switchMap(msg => signMsg(endgame, msg)),
        tap(msg =>
            setTimeout(() => endgame.config.handlers.put.next({...msg, endgame}))
        ),
        switchMap(() => endgame.config.handlers.put),
        skipWhile(msg => msg.path !== path),
        first()
    );

export const endgameGet = <T extends EndgameGraphValue, P extends string = string>(endgame: Endgame, path: string) => {
    setTimeout(() =>endgame.config.handlers.get.next({path, endgame}));
    return endgame.config.handlers.get.pipe(
        filter(payload => payload.path === path),
        map(({endgame, value, path}) => ({endgame, value: value as T, path}))
    )
};

export const endgameGetMeta = (endgame: Endgame, path: string) => {
    setTimeout(() => endgame.config.handlers.getMeta.next({endgame, path}));
    return endgame.config.handlers.getMeta.pipe(
        filter(payload => payload.path === path),
        map(({endgame, meta, path}) => ({endgame, path, meta}))
    )
}



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
        tap(msg => endgame.config.handlers.peersOut.next({endgame, msg}))
    );

export const trafficLogger = (() => {
    const start = Date.now();
    const endgames: Endgame[] = []
    return (endgame: Endgame) => of(endgame).pipe(
        tap(() => endgames.push(endgame)),
        switchMap(endgame => merge(
            endgame.config.handlers.peersOut.pipe(map(msg => ({
                type: 'peers-out',
                msg
            }))),
            endgame.config.handlers.peerIn.pipe(
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

const newEndgameConfig = (config: DeepPartial<EndgameConfig>) => ({
    isTrusted: config.isTrusted ?? false,
    name: config.name || `node-${getNetworkTime()}`,
    port: config.port || 11110,
    remoteWaitTime: 2000,
    handlers: {
        log: config.handlers?.log as EndgameConfig['handlers']['log'] || nullHandler<'log'>(),
        peerConnect: config.handlers?.peerConnect  as EndgameConfig['handlers']['peerConnect'] || nullHandler<'peerConnect'>(),
        login: config.handlers?.login as EndgameConfig['handlers']['login'] || nullHandler<'login'>(),
        logout: config.handlers?.logout as EndgameConfig['handlers']['logout'] || nullHandler<'logout'>(),
        createUser: config.handlers?.createUser as EndgameConfig['handlers']['createUser'] || nullHandler<'createUser'>(),
        peersOut: config.handlers?.peersOut as EndgameConfig['handlers']['peersOut'] || nullHandler<'peersOut'>(),
        peerIn: config.handlers?.peerIn as EndgameConfig['handlers']['peerIn'] || nullHandler<'peerIn'>(),
        put: config.handlers?.put as EndgameConfig['handlers']['put'] || nullHandler<'put'>(),
        get: config.handlers?.get as EndgameConfig['handlers']['get'] || nullHandler<'get'>(),
        getMeta: config.handlers?.getMeta as EndgameConfig['handlers']['getMeta'] || nullHandler<'getMeta'>()
    }
} satisfies EndgameConfig as EndgameConfig)
