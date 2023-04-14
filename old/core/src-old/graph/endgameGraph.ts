import {AbstractKeyIteratorOptions} from "abstract-level";

export type EndgameGraphValue = number | string | boolean;
export type EndgameKeysOptions = AbstractKeyIteratorOptions<string>;
export type EndgameGraphBundle<T extends EndgameGraphValue> = {
    path: string
    value: T
    meta: EndgameGraphMeta
}

export type EndgameGraphMeta = {
    sig: string
    ownerPath: string
    state: string       // num.timestamp
    rules: string[]
}


// export const pistolPut = <V extends PistolGraphValue, P extends string = string>(pistol: AuthenticatedPistol, path: P, value: V, opts: { perms?: number } = {perms: 0o775}) =>
//     serializePubKey(pistol.keys.pubKey).pipe(
//         map(pub => ({
//                 path,
//                 value,
//                 meta: {
//                     owner: pub,
//                     perms: opts.perms || 0o444,
//                     sig: '',
//                     timestamp: getNetworkTime()
//                 }
//             } satisfies PeerPutMsg['payload'] as PeerPutMsg['payload'])),
//             switchMap(msg => signMsg(pistol, msg)),
//             // TODO: Move this to someplace else
//             tap(({meta}) => sendMsg<PeerPutMsg>(pistol, 'put', {path, value, meta}).subscribe()),
//             map(({meta}) => ({pistol, path, value, meta}))
//         )

export const getNetworkTime = () => Date.now();


// export const sendPutFromLocalValue = (pistol: Pistol, path: string, opts: SendMsgOpts) =>
//     graphReadValue(pistol.store, path).pipe(
//         first(),
//         filter(({value}) => value !== undefined),
//         switchMap(({value}) => graphReadMeta(pistol.store, path).pipe(
//             map(({meta}) => ({meta, value}))
//         )),
//         tap(({meta, value}) => sendMsg<PeerPutMsg>(pistol, 'put', {
//             value,
//             meta,
//             path
//         }, opts).subscribe()),
//         map(msg => ({pistol, msg}))
//     );
//
//
// export const pistolLocalPut = (pistol: Pistol, path: string, value: PistolGraphValue, meta: PistolGraphMeta) =>
//     verifyTimestamp(pistol, path, meta.timestamp).pipe(
//         mergeMap(() => verifyMsgSig({path, value, meta})),
//         mergeMap(() => verifyPerms(pistol, {path, value, meta})),
//         mergeMap(() => graphPut(pistol.store, path, value, meta)),
//         map(() => ({pistol, path, value, meta, err: undefined})),
//         tap(({path, value, meta}) => pistolChainEmit<ChainGraphUpdate>(pistol, 'graph-update', {path, value, meta})),
//         catchError(err => {
//             pistolChainEmit<ChainLog>(pistol, 'log', {
//                 module: 'pistolGraph',
//                 level: 'error',
//                 time: new Date().toISOString(),
//                 code: 'PUT_ERROR',
//                 data: {err}
//             });
//             return of({pistol, path, value, meta, err})
//         })
//     );
//
// export const pistolRead = <T extends PistolGraphValue, P extends string = string>(pistol: Pistol, path: string) => {
//     sendMsg<PeerReadMsg>(pistol, 'read', {path, timestamp: getNetworkTime()}).subscribe();
//
//     return merge(
//         pistolChainListen<ChainPeerConnect>(pistol.baseApp.chainKeeper,'peer-connect').pipe(
//             mergeMap(() => sendMsg<PeerReadMsg>(pistol, 'read', {path, timestamp: getNetworkTime()})),
//             // These two lines are to fool the type system and not send anything down the stream
//             map(() => ({} as { pistol: Pistol, value: T })),
//             filter(() => false)
//         ),
//         pistolLocalRead(pistol, path).pipe(
//             map(({value}) => ({pistol, value: value as T}))
//         ),
//         pistolChainListen<ChainGraphUpdate>(pistol.baseApp.chainKeeper, 'graph-update').pipe(
//             filter(({payload}) => payload.path === path),
//             map(({payload}) => ({pistol, value: payload.value as T}))
//         )
//     );
// };
//
// export const pistolLocalRead = (pistol: Pistol, path: string) =>
//     graphReadValue(pistol.store, path).pipe(
//         map(({value}) => ({pistol, value}))
//     );
//
//
// export const pistolKeys = (pistol: Pistol, base: string, options: PistolKeysOptions = {}) => new Observable<{ pistol: Pistol, keys: string[] }>(sub => {
//     const updateSub = pistolChainListen<ChainGraphUpdate>(pistol.baseApp.chainKeeper, 'graph-update').pipe(
//         filter(msg => new RegExp(`^${base}\.[^\.]*$`).test(msg.payload.path)),
//         switchMap(() => graphKeys(pistol.store, base, options)),
//         map(({keys}) => sub.next({pistol, keys}))
//     ).subscribe();
//
//     const connectSub = pistolChainListen<ChainPeerConnect>(pistol.baseApp.chainKeeper, 'peer-connect').pipe(
//         tap(() => sendMsg<PeerKeysMsg>(pistol, 'keys', {base, timestamp: getNetworkTime(), options}).subscribe())
//     ).subscribe();
//
//     sendMsg<PeerKeysMsg>(pistol, 'keys', {base, timestamp: getNetworkTime(), options}).subscribe();
//
//     const lkSub = pistolLocalKeys(pistol, base, options).pipe().subscribe(it => sub.next(it))
//
//
//     return () => {
//         lkSub.unsubscribe();
//         updateSub.unsubscribe();
//         connectSub.unsubscribe();
//     }
// });
//
// export const pistolLocalKeys = (pistol: Pistol, base: string, options: PistolKeysOptions = {}) =>
//     graphKeys(pistol.store, base, options).pipe(
//         map(({keys}) => ({pistol, keys, base}))
//     );
//
//
// export const pistolReadMeta = (pistol: Pistol, path: string) =>
//     graphReadMeta(pistol.store, path).pipe(
//         map(({meta}) => ({pistol, meta}))
//     );
//
//
// export const verifyPerms = (pistol: Pistol, msg: PeerPutMsg['payload']) =>
//     graphReadMeta(pistol.store, msg.path).pipe(
//         map(({meta}) => meta === undefined || isWorldWritable(meta.perms) || meta.owner === msg.meta.owner),
//         switchMap(isValid => isValid ? of(isValid) : throwError(() => 'PERMISSION_DENIED'))
//     );
//
// export const verifyTimestamp = (pistol: Pistol, path: string, ts: number) => of(ts).pipe(
//     // Todo: I set this where different nodes could be off by 5 seconds, might need to revise in the future
//     tap(ts => {
//         if (ts > getNetworkTime() + 5_000) {
//             throw('INVALID_TIMESTAMP')
//         }
//     }),
//     tap(ts => {
//         if (!ts) {
//             throw('INVALID_TIMESTAMP')
//         }
//     }),
//     switchMap(() => pistolReadMeta(pistol, path)),
//     tap(({meta}) => {
//         if (meta !== undefined && meta.timestamp > ts) {
//             throw('OLD_MESSAGE_RECEIVED')
//         }
//     })
// )
//
// export const escapeKey = (() => {
//     const replacements: [RegExp, string][] = ['%', '.'].map(ch =>
//         [new RegExp(`\\${ch}`, 'g'), `%${ch.charCodeAt(0)}`]
//     )
//
//
//     return (key: string) =>
//         replacements.reduce((result, [regex, str]) => {
//             return result.replace(regex, str)
//         }, key)
// })();
//
// export const unescapeKey = (escaped: string) => escaped.replace(/%../g, v =>
//     String.fromCharCode(parseInt(v.replace('%', '')))
// );

