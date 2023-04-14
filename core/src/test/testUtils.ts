import {bufferCount,  from, map, mergeMap, Observable, of, Subject, switchMap, timer} from "rxjs";
import {AuthenticatedPistol, newPistol, pistolAuth, PistolOpts} from "../app/pistol.js";
import {dialPeer} from "../p2p/networkClient.js";
import {floodRouter} from "../p2p/floodRouter.js";
import {Parcel} from '@parcel/core';
import {deserializeKeys} from "../crypto/crypto.js";
import {ChainPair, ChainProps, newPistolConfig, PistolConfig} from "../app/pistolConfig.js";

/**
 * Starts a test network.  Peers are in the form of an array of nodes with the inner array being the node number of the peer
 * eg.  [1],[2],[0]  describes a network of three nodes where:
 * the first node is paired with the second
 * the second node is paired with the third
 * the third node is paired with the first
 */
export type StartTestNetworkOpts = PistolConfig & {
    username: string
}

export const testChains = (chains: Partial<PistolConfig['chains']>) => ({
    log: testDummyHandler<'log'>(),
    auth: testDummyHandler<'auth'>(),
    unauth: testDummyHandler<'unauth'>(),
    peerConnect: testDummyHandler<'peerConnect'>(),
    peersOut: testDummyHandler<'peersOut'>(),
    peerIn: testDummyHandler<'peerIn'>(),
    put: testDummyHandler<'put'>(),
    get: testDummyHandler<'get'>(),
    ...chains
} satisfies PistolConfig['chains'] as PistolConfig['chains'])

export const testAuthHandler = () => {
    const subject = new Subject<ChainProps<'auth'>>();
    const observer = subject.asObservable().pipe(
        switchMap(({pistol, password, userPath, username}) => getTestKeys().pipe(
            map(keys => ({...pistol, keys, username} satisfies AuthenticatedPistol as AuthenticatedPistol)),
            map(pistol => ({pistol, password, userPath, username}))
        ))
    ) as unknown as ChainPair<ChainProps<'auth'>>;

    observer.next = (v: ChainProps<'auth'>) => subject.next(v);
    return observer
};

export const testDummyHandler = <T extends keyof PistolConfig['chains']>(fn?: (v: ChainProps<T>) => ChainProps<T>) => {
    const subject = new Subject<ChainProps<T>>();
    const observer = subject.pipe(
        map((x: ChainProps<T>) => fn ? fn(x) : x)
    ) as unknown as ChainPair<ChainProps<T>>;

    observer.next = (v: ChainProps<T>) => subject.next(v);
    return observer
}












export const newTestPistol = (config: Partial<PistolConfig> = {}) =>
    of(config).pipe(
        map(config => newPistolConfig(config)),
        switchMap(config => newPistol({config: config}))
);


export const startTestNetwork = (nodeList: number[][] = [], opts: Partial<StartTestNetworkOpts> = {}) => from(nodeList).pipe(
    map((peers, n) => ({
        pistolConfig: {
            name: `node-${n}`,
            port: 11110 + n,
            ...opts
        } satisfies Partial<PistolConfig>,
        peers
    })),
    switchMap(({pistolConfig, peers}) => of(newPistolConfig(pistolConfig)).pipe(
        map(pistolConfig => ({pistolConfig, peers})),
    )),
    mergeMap(({pistolConfig, peers}, idx) => timer(idx * 100).pipe(
        switchMap(() => newTestPistol(pistolConfig)),
        switchMap(floodRouter),
        map(pistol => ({pistol, peers}))
    )),
    mergeMap(({pistol, peers}, n) => pistolAuth(pistol, opts.username || `username-${n}`, 'password', 'my.user').pipe(
        map(({pistol}) => ({pistol, peers}))
    )),
    mergeMap(({pistol, peers}) => peers.length ? from(peers).pipe(
        mergeMap(peerNo => dialPeer(pistol, `ws://localhost:${11110 + peerNo}`, {redialInterval: 1})),
        bufferCount(peers.length),
        map(() => pistol)
    ) : of(pistol)),
    bufferCount(nodeList.length),
    map(pistols => pistols.sort((a, b) => a.config.name < b.config.name ? -1 : 1))
);

export const startTestNode = (n: number = 0, peers: number[] = [], config: Partial<PistolOpts> = {}) => of(config satisfies Omit<PistolOpts, 'config'>).pipe(
    switchMap(config => of(newPistolConfig({})).pipe(
        map(baseApp => ({...config, config: baseApp} satisfies PistolOpts))
    )),
    switchMap(config => newPistol(config)),
    switchMap(floodRouter),
    switchMap(pistol => peers.length ? from(peers).pipe(
        map(peerNo => ({pistol, peerNo})),
        mergeMap(({pistol, peerNo}) => dialPeer(pistol, `ws:localhost:${11110 + peerNo}`, {
            redialInterval: 1
        })),
        bufferCount(peers.length),
        map(([pistol]) => pistol)
    ) : of(pistol))
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


