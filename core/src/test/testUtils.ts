import {bufferCount, from, map, mergeMap, Observable, of, switchMap, timer} from "rxjs";
import {AuthenticatedEndgame, endgameCreateUser, endgameLogin, newEndgame} from "../app/endgame.js";
import {dialPeer} from "../p2p/networkClient.js";
import {floodRouter} from "../p2p/floodRouter.js";
import {Parcel} from '@parcel/core';
import {EndgameConfig} from "../app/endgameConfig.js";
import {handlers} from "../handlers/handlers.js";
import {createUserHandler} from "../handlers/auth-handlers/createUserHandler.js";
import {passwordAuthHandler} from "../handlers/auth-handlers/passwordAuthHandler.js";
import {
    memoryStoreGetHandler,
    memoryStoreGetMetaHandler,
    memoryStorePutHandler
} from "../handlers/store-handlers/memoryStoreHandlers.js";
import {logoutHandler} from "../handlers/auth-handlers/logoutHandler.js";
import {DeepPartial} from "tsdef";


export const testLocalEndgame = (partialConfig: DeepPartial<EndgameConfig> = {}) =>
    newEndgame({
        handlers: {
            createUser: handlers([createUserHandler]),
            login: handlers([passwordAuthHandler]),
            logout: handlers([logoutHandler]),
            get: handlers([memoryStoreGetHandler]),
            put: handlers([memoryStorePutHandler]),
            getMeta: handlers([memoryStoreGetMetaHandler]),
            ...partialConfig.handlers
        },
        ...partialConfig
    });
export const testLocalAuthedEndgame = (partialConfig: DeepPartial<EndgameConfig & {username?: string, password: string, userPath: string}> = {}) =>
    testLocalEndgame(partialConfig).pipe(
        switchMap(endgame => endgameCreateUser(endgame, partialConfig.username || 'username', partialConfig.password || 'password', partialConfig.userPath || 'my.user')),
        switchMap(({endgame}) => endgameLogin(endgame, partialConfig.username || 'username', partialConfig.password || 'password', partialConfig.userPath || 'my.user')),
        map(({endgame}) => endgame as AuthenticatedEndgame)
    );


/**
 * Starts a test network.  Peers are in the form of an array of nodes with the inner array being the node number of the peer
 * eg.  [1],[2],[0]  describes a network of three nodes where:
 * the first node is paired with the second
 * the second node is paired with the third
 * the third node is paired with the first
 */
export type StartTestNetworkOpts = EndgameConfig & {
    username: string
}



export const startTestNetwork = (nodeList: number[][] = [], opts: Partial<StartTestNetworkOpts> = {}) => from(nodeList).pipe(
    map((peers, n) => ({
        endgameConfig: {
            name: `node-${n}`,
            ...opts
        } satisfies Partial<EndgameConfig>,
        peers
    })),
    mergeMap(({endgameConfig, peers}, idx) => timer(idx * 100).pipe(
        switchMap(() => newEndgame(endgameConfig)),
        switchMap(floodRouter),
        map(endgame => ({endgame, peers}))
    )),
    mergeMap(({
                  endgame,
                  peers
              }, n) => endgameLogin(endgame, opts.username || `username-${n}`, 'password', 'my.user').pipe(
        map(({endgame}) => ({endgame, peers}))
    )),
    mergeMap(({endgame, peers}) => peers.length ? from(peers).pipe(
        mergeMap(peerNo => dialPeer(endgame, `ws://localhost:${11110 + peerNo}`, {redialInterval: 1})),
        bufferCount(peers.length),
        map(() => endgame)
    ) : of(endgame)),
    bufferCount(nodeList.length),
    map(endgames => endgames.sort((a, b) => a.config.name < b.config.name ? -1 : 1))
);

export const startTestNode = (n: number = 0, peers: number[] = [], config: Partial<EndgameConfig> = {}) => of(config).pipe(
    switchMap(config => newEndgame(config)),
    switchMap(floodRouter),
    switchMap(endgame => peers.length ? from(peers).pipe(
        map(peerNo => ({endgame, peerNo})),
        mergeMap(({endgame, peerNo}) => dialPeer(endgame, `ws:localhost:${11110 + peerNo}`, {
            redialInterval: 1
        })),
        bufferCount(peers.length),
        map(([endgame]) => endgame)
    ) : of(endgame))
);

export const compileBrowserCode = (src: string) =>
    of({
        entries: src,
        defaultConfig: '@parcel/config-default',
        serveOptions: {
            port: 1234
        },
    }).pipe(
        map(config => new Parcel(config)),
        switchMap(bundler => new Observable(sub => {
            let bundlerSub: { unsubscribe: () => Promise<any> };
            bundler.watch((err, result) => {
                if (err) {
                    throw err
                }
                if (result?.type === 'buildSuccess') {
                    sub.next(result)
                } else {
                    throw result
                }
            })
                .then(bs => bundlerSub = bs)
            return () =>
                of(bundlerSub).pipe(
                    switchMap(bundlerSub => bundlerSub.unsubscribe()),
                ).subscribe();
        })));





