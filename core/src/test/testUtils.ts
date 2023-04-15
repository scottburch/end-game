import {bufferCount,  from, map, mergeMap, Observable, of, Subject, switchMap, timer} from "rxjs";
import {AuthenticatedEndgame, newEndgame, endgameAuth, EndgameOpts} from "../app/endgame.js";
import {dialPeer} from "../p2p/networkClient.js";
import {floodRouter} from "../p2p/floodRouter.js";
import {Parcel} from '@parcel/core';
import {deserializeKeys} from "../crypto/crypto.js";
import {ChainPair, ChainProps, newEndgameConfig, EndgameConfig} from "../app/endgameConfig.js";

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

export const testChains = (chains: Partial<EndgameConfig['chains']>) => ({
    log: testDummyHandler<'log'>(),
    auth: testDummyHandler<'auth'>(),
    unauth: testDummyHandler<'unauth'>(),
    peerConnect: testDummyHandler<'peerConnect'>(),
    peersOut: testDummyHandler<'peersOut'>(),
    peerIn: testDummyHandler<'peerIn'>(),
    put: testDummyHandler<'put'>(),
    get: testDummyHandler<'get'>(),
    getMeta: testDummyHandler<'getMeta'>(),
    ...chains
} satisfies EndgameConfig['chains'] as EndgameConfig['chains'])

export const testAuthHandler = () => {
    const subject = new Subject<ChainProps<'auth'>>();
    const observer = subject.asObservable().pipe(
        switchMap(({endgame, password, userPath, username}) => getTestKeys().pipe(
            map(keys => ({...endgame, keys, username} satisfies AuthenticatedEndgame as AuthenticatedEndgame)),
            map(endgame => ({endgame, password, userPath, username}))
        ))
    ) as unknown as ChainPair<ChainProps<'auth'>>;

    observer.next = (v: ChainProps<'auth'>) => subject.next(v);
    return observer
};

export const testDummyHandler = <T extends keyof EndgameConfig['chains']>(fn?: (v: ChainProps<T>) => ChainProps<T>) => {
    const subject = new Subject<ChainProps<T>>();
    const observer = subject.pipe(
        map((x: ChainProps<T>) => fn ? fn(x) : x)
    ) as unknown as ChainPair<ChainProps<T>>;

    observer.next = (v: ChainProps<T>) => subject.next(v);
    return observer
}












export const newTestEndgame = (config: Partial<EndgameConfig> = {}) =>
    of(config).pipe(
        map(config => newEndgameConfig(config)),
        switchMap(config => newEndgame({config: config}))
);


export const startTestNetwork = (nodeList: number[][] = [], opts: Partial<StartTestNetworkOpts> = {}) => from(nodeList).pipe(
    map((peers, n) => ({
        endgameConfig: {
            name: `node-${n}`,
            port: 11110 + n,
            ...opts
        } satisfies Partial<EndgameConfig>,
        peers
    })),
    switchMap(({endgameConfig, peers}) => of(newEndgameConfig(endgameConfig)).pipe(
        map(endgameConfig => ({endgameConfig, peers})),
    )),
    mergeMap(({endgameConfig, peers}, idx) => timer(idx * 100).pipe(
        switchMap(() => newTestEndgame(endgameConfig)),
        switchMap(floodRouter),
        map(endgame => ({endgame, peers}))
    )),
    mergeMap(({endgame, peers}, n) => endgameAuth(endgame, opts.username || `username-${n}`, 'password', 'my.user').pipe(
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

export const startTestNode = (n: number = 0, peers: number[] = [], config: Partial<EndgameOpts> = {}) => of(config satisfies Omit<EndgameOpts, 'config'>).pipe(
    switchMap(config => of(newEndgameConfig({})).pipe(
        map(baseApp => ({...config, config: baseApp} satisfies EndgameOpts))
    )),
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

export const getSerializedTestKeys = () => of({
    "pub": "MDRhY2ZhZTJhNDBkMzQxN2E4MDVlNWE2YWRmYzMzZGI5YTA3N2IzNGI0YmNkYTNkMmYxYWVhNDFmMjg0YWQzYTc3ZWIzYTZjNzgxZTE2OGFjNmE3YTI0YTVkMTdhZGFiM2I4YzU5MmQ1N2M0NWM4YmNmMjk0OGQ0MWU2YjBlNGNhMg==",
    "priv": "NmNkMzUzZGQwMmE1NTIyOTcwMDA5MWNkYzY3NWY5YzNkZGY3OTdlYmFhZDJjN2U1YzVkZjk0ODM3YzRhNjg0MTgzODM5M2QzZjE4YjUyYzZjYjQ5MzMwNzk4M2RhMGRkYTEyZTFmZjA0NzI4YWUwYTA3MjE2ZjI4ZjQ2MGY5OGJkZTc0MGM5MjI5ZDEzYTY3NGEwYzQ5MWUzMWNmODQ2ZDNjMjk4N2QzMGE2YmYzZWE0OWE5YzE4MTdlZjhjY2MwZmUwNDk3MzE1ZDIzYjVlNTlkMjA5ZjZhNzcyOGUxZmJmYWRjZmQ4YTViZDNjZDVmNDJlMWRjNGQ5OGY1NWM4NTVhNDRhNGYyNmU0MDQ5ZDJlYzkwZjk3MzM5ZGZlNTNi",
    "enc": "OTY3OWZlNDVmNWYxYjE3ZWRmYzM5OWU2NmYwNzUzZWZiMzA3NmE4MDBkZDBkYzE2NTBhNTFkYmI2ZjQ0ZmE5MjZmNTEyNjNkMDgwMzg5NDMzOTkwODI3MTBmM2ExODBk",
    "salt": "NjQzMDM4Mzg2NjY0NjUzNjM1MzgzMTYxMzQzODMxNjQ="
})

export const getTestKeys = () => getSerializedTestKeys().pipe(
    switchMap(serKeys => deserializeKeys(serKeys, 'my-pass'))
)


