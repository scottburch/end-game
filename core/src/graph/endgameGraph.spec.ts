import {getNetworkTime,} from "./endgameGraph.js";
import {PeerPutMsg} from "../p2p/peerMsg.js";

const subtle = crypto.subtle;

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

describe.skip('pistol graph', function () {
    this.timeout(10_000);

    // it('should verify the sig when a value is stored', (done) => {
    //     newTestPistol().pipe(
    //         map(pistol => ({pistol, msg: getBaseMsg({meta: {sig: 'fake-sig'}})})),
    //         switchMap(({pistol, msg}) => pistolLocalPut(pistol, msg.path, msg.value, msg.meta)),
    //         tap(({err}) => expect(err.message).to.match(/Invalid keyData/)),
    //         first(),
    //     ).subscribe(() => done())
    // });
    //
    // it('should overwrite a value if it is written by the same user', (done) => {
    //     newTestPistol().pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         switchMap(pistol => writeValue(pistol, {})),
    //         switchMap(({pistol}) => pistolRead(pistol, 'my-graph.my-path').pipe(first())),
    //         tap(({value}) => expect(value).to.equal(10)),
    //         switchMap(({pistol}) => writeValue(pistol, {value: 30})),
    //         switchMap(({pistol}) => pistolRead(pistol,'my-graph.my-path')),
    //         tap(({value}) => expect(value).to.equal(30)),
    //         first()
    //     ).subscribe(() => done())
    // });
    //
    // it('should get the metadata for an entry', (done) => {
    //     newTestPistol().pipe(
    //         take(1),
    //         switchMap(pistol => writeValue(pistol, {})),
    //         switchMap(({pistol}) => pistolReadMeta(pistol, 'my-graph.my-path')),
    //         tap(({meta}) => {
    //             expect(meta.owner).to.have.length(176);
    //             expect(meta.sig).to.have.length(128);
    //             expect(meta.perms).to.equal(511);
    //         }),
    //         first()
    //     ).subscribe(() => done())
    // });
    //
    // it('should fail to update if updated by a different account if not world writable', () =>
    //     firstValueFrom(newTestPistol().pipe(
    //         switchMap(pistol => of(pistol).pipe(
    //             switchMap(() => writeValue(pistol, {perms: 0o775})),
    //             switchMap(() => writeValue(pistol, {value: 50})),
    //             tap(({err}) => expect(err).to.equal('PERMISSION_DENIED'))
    //         ))
    //     ))
    // );
    //
    // it('should recover from a write from someone unauthorized', () =>
    //     firstValueFrom(newTestPistol().pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'user0', keys)),
    //         switchMap(pistol => pistolPut(pistol, 'some', 'value1')),
    //         delay(500),
    //         switchMap(({pistol}) => pistolGet<string>(pistol, 'some')),
    //         filter((_, idx) => idx === 0),
    //         tap(({value}) => expect(value).to.equal('value1')),
    //
    //         switchMap(({pistol}) => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'user1', keys)),
    //         switchMap(pistol => pistolPut(pistol as AuthenticatedPistol, 'some', 'value2')),
    //         delay(500),
    //         switchMap(({pistol}) => firstValueFrom(pistolRead(pistol, 'some'))),
    //         tap(({value}) => expect(value).to.equal('value1')),
    //
    //         switchMap(({pistol}) => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'user0', keys)),
    //         switchMap(pistol => pistolPut(pistol, 'some', 'value3')),
    //         delay(500),
    //         switchMap(({pistol}) => pistolRead(pistol,'some')),
    //     ))
    // );
    //
    //
    // it('should handle references', done => {
    //     newTestPistol().pipe(
    //         take(1),
    //         switchMap(pistol => writeValue(pistol, {})),
    //         switchMap(({pistol}) => writeValue(pistol, {
    //             path: 'my-graph.foo',
    //             value: '@@my-graph.my-path'
    //         })),
    //         switchMap(({pistol}) => pistolRead(pistol, 'my-graph.foo')),
    //         tap(({value}) => expect(value).to.equal(10)),
    //         first()
    //     ).subscribe(() => done());
    // });
    //
    // it('should handle parallel writes and reads', (done) => {
    //     newTestPistol().pipe(
    //         take(1),
    //         switchMap(pistol => of(pistol).pipe(
    //             switchMap(() => range(1, 10)),
    //             mergeMap(n => writeValue(pistol, {path: `my-graph.key-${n}`, value: `value-${n}`}).pipe(map(() => n))),
    //             mergeMap(n => pistolRead(pistol, `my-graph.key-${n}`).pipe(first())),
    //             map(({value}) => value),
    //             toArray(),
    //             tap(result => expect(result).to.deep.equal(["value-1", "value-2", "value-3", "value-4", "value-5", "value-6", "value-7", "value-8", "value-9", "value-10"])),
    //             switchMap(() => range(1, 10)),
    //             mergeMap(n => pistolRead(pistol,`my-graph.key-${n}`).pipe(first())),
    //             map(({value}) => value),
    //             toArray(),
    //             tap(result => expect(result).to.deep.equal(["value-1", "value-2", "value-3", "value-4", "value-5", "value-6", "value-7", "value-8", "value-9", "value-10"]))
    //         ))
    //     ).subscribe(() => done())
    // });
    //
    // it('should set values across peers', (done) => {
    //     startTestNetwork([[1], []]).pipe(
    //         switchMap(pistols => pistolPut(pistols[0], 'my.path', 'my-value').pipe(
    //             map(() => pistols)
    //         )),
    //         delay(1000),
    //         switchMap(pistols => pistolGet(pistols[1], 'my.path')),
    //         tap(response => expect(response.value).to.equal('my-value')),
    //         first()
    //     ).subscribe(() => done());
    // });
    //
    // it('should read a value from another node when a value is requested', (done) => {
    //     startTestNetwork(([[]])).pipe(
    //         switchMap(([pistol]) => pistolPut(pistol, 'my.path', 'my-value')),
    //         switchMap(() => startTestNode(1, [0])),
    //         switchMap(pistol => pistolRead(pistol, 'my.path')),
    //         skipWhile(response => response.value !== 'my-value'),
    //         first()
    //     ).subscribe(() => done())
    // });
    //
    // it('should get keys from a local node as well as other nodes', () =>
    //     firstValueFrom(startTestNetwork([[]]).pipe(
    //         map(pistols => pistols[0]),
    //         switchMap(pistol => pistolPut(pistol, 'my.base.a', 'a')),
    //         switchMap(({pistol}) => pistolPut(pistol, 'my.base.b', 'b')),
    //         switchMap(({pistol}) => startTestNode(1, [0]).pipe(map(newPistol => ([pistol, newPistol])))),
    //         tap(pistols => pistolTrafficLogger(pistols[1])),
    //         switchMap(pistols => pistolKeys(pistols[1], 'my.base')),
    //         skipWhile(({keys}) => keys.length < 2),
    //         tap(({keys}) => expect(keys).to.deep.equal(['a', 'b']))
    //     ))
    // );
    //
    // it('should be able to send search params for getting keys', () =>
    //     firstValueFrom(startTestNetwork([[1], []]).pipe(
    //         switchMap(pistols => range(0, 10).pipe(
    //             mergeMap(n => pistolPut(pistols[0], `my.base.${n}`, n)),
    //             last(),
    //             map(() => pistols)
    //         )),
    //         switchMap(pistols => pistolKeys(pistols[1], 'my.base', {gt: '3', limit: 3})),
    //         skipWhile(({keys}) => keys.length < 3),
    //         tap(({keys}) => expect(keys).to.deep.equal(['4', '5', '6']))
    //     ))
    // );
    //
    // it('should be able to search for text', () =>
    //     firstValueFrom(startTestNetwork([[]]).pipe(
    //         map(([pistol]) => pistol),
    //         switchMap(pistol => from(['alice','bob','alfi', 'charlie']).pipe(
    //             mergeMap(n => pistolPut(pistol, `my.base.${n}`, 'x')),
    //             last(),
    //             map(() => pistol),
    //         )),
    //         switchMap(pistol => pistolKeys(pistol, 'my.base', {gt: 'b'})),
    //         skipWhile(({keys}) => keys.length !== 2 || keys[0] !== 'bob' || keys[1] !== 'charlie'),
    //         switchMap(({pistol}) => pistolKeys(pistol, 'my.base', {gt: 'c'})),
    //         skipWhile(({keys}) => keys.length !== 1 || keys[0] !== 'charlie')
    //     ))
    // );
    //
    // it('can handle no response when using criteria', () =>
    //     firstValueFrom(startTestNode(0).pipe(
    //         switchMap(pistol => pistolKeys(pistol, 'fake.base', {gt: 'no-exist'})),
    //         map(({keys}) => keys),
    //         bufferTime(500),
    //         tap(results => expect(results).to.deep.equal([[]]))
    //     ))
    // );
    //
    // it('should use options to get keys when connecting to a remote node after', () =>
    //     firstValueFrom(startTestNode(0).pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         switchMap(pistol => range(0, 10).pipe(
    //             mergeMap(n => pistolPut(pistol, `my.base.${n}`, n)),
    //             toArray(),
    //             map(() => pistol)
    //         )),
    //         delay(100),
    //         switchMap(() => startTestNode(1, [0])),
    //         switchMap(pistol => pistolKeys(pistol, 'my.base', {gt: '3', limit: 2})),
    //         skipWhile(({keys}) => keys.length < 2),
    //         tap(({keys}) => expect(keys).to.deep.equal(['4', '5'])),
    //     ))
    // );
    //
    //
    // it('should notify a second node when the first one updates', (done) => {
    //     startTestNetwork([[], [0]]).pipe(
    //         switchMap(pistols => generateNewAccount().pipe(map(keys => ({pistols, keys})))),
    //         switchMap(({pistols, keys}) => pistolAuth(pistols[0], 'my-username', keys).pipe(map(() => pistols))),
    //         switchMap(pistols => pistolPut(pistols[0], 'my.path', 'my-value').pipe(map(() => pistols))),
    //         switchMap(pistols => pistolChainListen<ChainGraphUpdate>(pistols[0].baseApp.chainKeeper, 'graph-update')),
    //         tap(({pistol, payload: {path, value, meta}}) => {
    //             expect(path).to.equal('my.path');
    //             expect(value).to.equal('my-value');
    //             expect(meta.perms).to.equal(0o775)
    //         }),
    //         first()
    //     ).subscribe(() => done())
    // });
    //
    // it('should reject sending values across peers with the wrong auth', function (done) {
    //     let err0: string;
    //     let err1: string;
    //
    //     startTestNetwork([[], [0]]).pipe(
    //         tap(pistols => {
    //             pistolChainListen<ChainLog>(pistols[0].baseApp.chainKeeper, 'log').subscribe(({payload}) => err0 = payload.data.err)
    //         }),
    //         switchMap(writeLegit),
    //         delay(100),
    //         switchMap(pistols => pistolRead(pistols[0], 'my.path').pipe(
    //             tap(({value}) => expect(value).to.equal('my-value')),
    //             map(() => pistols)
    //         )),
    //         switchMap(pistols => pistolRead(pistols[1], 'my.path').pipe(
    //             tap(({value}) => expect(value).to.equal('my-value')),
    //             map(() => pistols)
    //         )),
    //         switchMap(writeNonLegit),
    //         delay(100),
    //         switchMap(pistols => pistolRead(pistols[0], 'my.path').pipe(
    //             tap(({value}) => expect(value).to.equal('my-value')),
    //             map(() => pistols)
    //         )),
    //         switchMap(pistols => pistolRead(pistols[1], 'my.path').pipe(
    //             tap(({value}) => expect(value).to.equal('my-value')),
    //             map(() => pistols)
    //         )),
    //         tap(() => expect(err0).to.equal('INVALID_SIGNATURE')),
    //         tap(() => expect(err1).to.equal('INVALID_SIGNATURE')),
    //         first()
    //     ).subscribe(() => done());
    //
    //     function writeNonLegit(pistols: AuthenticatedPistol[]) {
    //         return of(pistols).pipe(
    //             switchMap(pistols => generateNewAccount().pipe(
    //                 switchMap(acc => subtle.exportKey('raw', acc.pubKey)),
    //                 map(pubKey => ({
    //                     path: 'my.path',
    //                     value: 'fake-value',
    //                     meta: {
    //                         owner: bytesToHex(new Uint8Array(pubKey)),
    //                         perms: 0o777,
    //                         sig: '',
    //                         timestamp: getNetworkTime()
    //                     }
    //                 } satisfies PeerPutMsg['payload'])),
    //                 switchMap(msg => signMsg(pistols[0], msg)),
    //                 switchMap(msg => sendMsg<PeerPutMsg>(pistols[0], 'put', {
    //                     path: msg.path,
    //                     value: msg.value,
    //                     meta: msg.meta
    //                 })),
    //             )),
    //             map(() => pistols)
    //         )
    //     }
    //
    //     function writeLegit(pistols: AuthenticatedPistol[]) {
    //         return of(pistols).pipe(
    //             switchMap(pistols => generateNewAccount().pipe(map(keys => ({pistols, keys})))),
    //             switchMap(({pistols, keys}) => pistolAuth(pistols[0], 'my-username', keys).pipe(
    //                 map(authedPistol => ([authedPistol, ...pistols.slice(1)]))
    //             )),
    //             switchMap(pistols => pistolPut(pistols[0], 'my.path', 'my-value').pipe(
    //                 map(() => pistols)
    //             )),
    //         )
    //     }
    // });
    //
    // it('should resend a keys request on connecting to a new peer', (done) => {
    //     let dialSub: Subscription;
    //
    //     startTestNode(1).pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({pistol, keys})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         switchMap(pistol => pistolPut(pistol, 'my.key.a', 'a')),
    //         switchMap(({pistol}) => pistolPut(pistol, 'my.key.b', 'b')),
    //
    //         switchMap(() => startTestNode(0)),
    //         tap((pistol) => setTimeout(() => dialSub = dialPeer(pistol, 'ws://localhost:11111').subscribe(), 500)),
    //
    //         switchMap(pistol => pistolKeys(pistol, 'my.key')),
    //
    //         skipWhile(({keys}) => keys.length < 2),
    //         first(),
    //         tap(({keys}) => expect(keys).to.deep.equal(['a', 'b'])),
    //         tap(() => dialSub.unsubscribe())
    //     ).subscribe(() => done());
    // });
    //
    // // Skipping for now until I resolve the network time issue with Raspberry PI or nodes not syncing NTP
    // it('should not write a value if the timestamp is not provided', () =>
    //     firstValueFrom(newTestPistol().pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         switchMap(pistol => serializePubKey(pistol.keys.pubKey).pipe(map(
    //             pubKeyHex => ({pubKeyHex, pistol})
    //         ))),
    //         switchMap(({pistol, pubKeyHex}) => of(pistol).pipe(
    //             map(() => ({
    //                 path: 'my.path',
    //                 value: 1,
    //                 meta: {
    //                     owner: pubKeyHex,
    //                     perms: 0o777,
    //                     sig: '',
    //                     timestamp: 0
    //                 }
    //             } satisfies PeerPutMsg['payload'])),
    //             switchMap(msg => signMsg(pistol, msg)),
    //             switchMap(msg => pistolLocalPut(pistol, msg.path, msg.value, msg.meta).pipe(map(() => msg))),
    //             switchMap(msg => pistolLocalRead(pistol, msg.path)),
    //             tap(({value}) => expect(value).to.be.undefined)
    //         ))
    //     ))
    // );
    //
    //
    // // Skipping for now until I resolve the network time issue with Raspberry PI or nodes not syncing NTP
    // it('should not write a value if the timestamp is in the future', () =>
    //     firstValueFrom(newTestPistol().pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         switchMap(pistol => serializePubKey(pistol.keys.pubKey).pipe(
    //             map(pubKeyHex => ({pubKeyHex, pistol}))
    //         )),
    //         switchMap(({pistol, pubKeyHex}) => of(pistol).pipe(
    //             map(() => ({
    //                 path: 'my.path',
    //                 value: 1,
    //                 meta: {
    //                     owner: pubKeyHex,
    //                     perms: 0o777,
    //                     sig: '',
    //                     timestamp: getNetworkTime() + 65_000
    //                 }
    //             } satisfies PeerPutMsg['payload'])),
    //             switchMap(msg => signMsg(pistol, msg)),
    //             switchMap(msg => pistolLocalPut(pistol, msg.path, msg.value, msg.meta).pipe(map(() => msg))),
    //             switchMap(msg => pistolLocalRead(pistol, msg.path)),
    //             tap(({value}) => expect(value).to.be.undefined)
    //         ))
    //     ))
    // );
    //
    // // Skipping for now until I resolve the network time issue with Raspberry PI or nodes not syncing NTP
    // it('should not write a value if the timestamp is older than the one that already exists', () =>
    //     firstValueFrom(newTestPistol().pipe(
    //         switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //         switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         switchMap(pistol => serializePubKey(pistol.keys.pubKey).pipe(
    //             map(pubKeyHex => ({pubKeyHex, pistol}))
    //         )),
    //         switchMap(({pistol, pubKeyHex}) => of(pistol).pipe(
    //             map(() => ({
    //                 path: 'my.path',
    //                 value: 1,
    //                 meta: {
    //                     owner: pubKeyHex,
    //                     perms: 0o777,
    //                     sig: '',
    //                     timestamp: getNetworkTime()
    //                 }
    //             } satisfies PeerPutMsg['payload'])),
    //             switchMap(msg => signMsg(pistol, msg)),
    //             switchMap(msg => pistolLocalPut(pistol, msg.path, msg.value, msg.meta).pipe(map(() => msg))),
    //             map(msg => ({
    //                 ...msg,
    //                 value: 2,
    //                 meta: {
    //                     ...msg.meta,
    //                     sig: '',
    //                     timestamp: getNetworkTime() - 2000
    //                 }
    //             })),
    //             switchMap(msg => signMsg(pistol, msg)),
    //             switchMap(msg => pistolLocalPut(pistol, msg.path, msg.value, msg.meta)),
    //             switchMap(() => pistolLocalRead(pistol, 'my.path')),
    //             tap(({value}) => expect(value).to.equal(1))
    //         )),
    //     ))
    // );
    //
    // it('should not bounce puts back from endpoints', (done) =>
    //     combineLatest([
    //         newTestPistol().pipe(            switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //             switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         ),
    //         newTestPistol({port: 11111})
    //     ]).pipe(
    //         switchMap(pistols => dialPeer(pistols[0], 'ws://localhost:11111').pipe(
    //             map(() => pistols)
    //         )),
    //         switchMap(pistols => pistolPut(pistols[0], 'my.key', 1).pipe(
    //             map(() => pistols)
    //         )),
    //         switchMap(pistols => pistolChainListen<ChainPeersOut>(pistols[0].baseApp.chainKeeper,  'peers-out')),
    //         tap(() => {
    //             done('should not have a event out')
    //         }),
    //         timeout(2000),
    //         catchError(() => of(true))
    //     ).subscribe(() => done())
    // );
    //
    // it('should reconcile writes to different pistol instances', () => {
    //     return firstValueFrom(combineLatest([
    //         newTestPistol({name: 'client1'}).pipe(
    //             switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //             switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         ),
    //         newTestPistol({name: 'client2', port: 11111}),
    //     ]).pipe(
    //         map(clients => ({clients})),
    //         map(ctx => ({
    //             ...ctx,
    //             middleSub: newTestPistol({name: 'middle-1', port: 11113}).pipe(
    //                 switchMap(floodRouter)
    //             ).subscribe()
    //         })),
    //         switchMap(ctx => combineLatest([
    //             dialPeer(ctx.clients[0], 'ws://localhost:11113'),
    //             dialPeer(ctx.clients[1], 'ws://localhost:11113')
    //         ]).pipe(map(() => ctx))),
    //         filter((_, idx) => idx === 0),
    //         switchMap(ctx => pistolPut(ctx.clients[0], 'my.path', 1).pipe(
    //             map(() => ctx)
    //         )),
    //         switchMap(ctx => pistolRead(ctx.clients[1], 'my.path').pipe(
    //             skipWhile(({value}) => value !== 1),
    //             map(() => ctx)
    //         )),
    //         filter((_, idx) => idx === 0),
    //         delay(500),
    //         tap(() => console.log('********* dropping middle')),
    //         tap(ctx => ctx.middleSub.unsubscribe()),
    //         delay(1000),
    //         switchMap(ctx => pistolPut(ctx.clients[0], 'my.path', 2).pipe(
    //             map(() => ctx)
    //         )),
    //         delay(1000),
    //         tap(() => console.log("*********** starting new middle")),
    //         map(ctx => ({
    //             ...ctx,
    //             middleSub: newTestPistol({name: 'middle-2', port: 11113}).pipe(
    //                 switchMap(floodRouter)
    //             ).subscribe()
    //         })),
    //
    //         delay(1000),
    //         switchMap(ctx => pistolLocalRead(ctx.clients[1], 'my.path').pipe(
    //             skipWhile(({value}) => value !== 2),
    //             map(() => ctx)
    //         )),
    //         tap(ctx => ctx.middleSub.unsubscribe())
    //     ));
    // });
    //
    // describe('sendPutFromLocalValue()', () => {
    //     it('should send a put if there is a value', (done) => {
    //         firstValueFrom(newTestPistol().pipe(
    //             switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //             switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //             switchMap(pistol => graphPut(pistol.store, 'my.path', 1, {perms: 0o777}).pipe(
    //                 map(() => pistol)
    //             )),
    //             tap(pistol => pistolChainListen<ChainPeersOut>(pistol.baseApp.chainKeeper,'peers-out').pipe(
    //                 tap(result => {
    //                     expect(result.payload.from).to.equal(pistol.id);
    //                     expect(result.payload.cmd === 'put');
    //                     expect(result.payload).to.deep.equal({
    //                         value: 1,
    //                         meta: {perms: 0o777},
    //                         path: 'my.path'
    //                     });
    //                     expect(result.payload.forward).to.be.false;
    //                     done()
    //                 })
    //             ).subscribe()),
    //             switchMap(pistol => sendPutFromLocalValue(pistol, 'my.path', {local: false, forward: false})),
    //         ))
    //     });
    // });
    //
    // it('should update a list across peers and reconcile on outage', (done) => {
    //     let results: string[] = [];
    //     firstValueFrom(combineLatest([
    //         newTestPistol({name: 'client1'}).pipe(
    //             switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
    //             switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
    //         ),
    //         newTestPistol({name: 'client2', port: 11111}),
    //     ]).pipe(
    //         map(clients => ({clients})),
    //         map(ctx => ({
    //             ...ctx,
    //             middleSub: newTestPistol({name: 'middle-1', port: 11113}).pipe(
    //                 switchMap(floodRouter)
    //             ).subscribe()
    //         })),
    //         switchMap(ctx => combineLatest([
    //             dialPeer(ctx.clients[0], 'ws://localhost:11113'),
    //             dialPeer(ctx.clients[1], 'ws://localhost:11113')
    //         ]).pipe(map(() => ctx))),
    //         filter((_, idx) => idx === 0),
    //         switchMap(ctx => combineLatest([
    //             pistolPut(ctx.clients[0], 'my.path.a', 1),
    //             pistolPut(ctx.clients[0], 'my.path.b', 2),
    //             pistolPut(ctx.clients[0], 'my.path.c', 3)
    //         ]).pipe(
    //             map(() => ctx),
    //         )),
    //
    //         tap(ctx => pistolKeys(ctx.clients[1], 'my.path').pipe(
    //             skipWhile(({keys}) => keys.length < 4),
    //             tap(({keys}) => results = keys),
    //             first()
    //         ).subscribe()),
    //         filter((_, idx) => idx === 0),
    //         delay(500),
    //         tap(() => console.log('********* dropping middle')),
    //         tap(ctx => ctx.middleSub.unsubscribe()),
    //         delay(500),
    //         switchMap(ctx => pistolPut(ctx.clients[0], 'my.path.d', 4).pipe(
    //             map(() => ctx),
    //         )),
    //         delay(200),
    //         tap(() => console.log("*********** starting new middle")),
    //         map(ctx => ({
    //             ...ctx,
    //             middleSub: newTestPistol({name: 'middle-2', port: 11113}).pipe(
    //                 switchMap(floodRouter)
    //             ).subscribe()
    //         })),
    //         delay(2000),
    //         tap(() => expect(results).to.deep.equal(['a', 'b', 'c', 'd'])),
    //         tap(ctx => ctx.middleSub.unsubscribe()),
    //         tap(() => done())
    //     ));
    // });
    //
    // describe('escapeKey() function', () => {
    //     it('should not escape a key that has no special characters', () =>
    //         expect(escapeKey('testing')).to.equal('testing')
    //     );
    //
    //     it('should escape a key with a dot in it', () => {
    //         expect(escapeKey('this.that.other')).to.equal('this%46that%46other');
    //         expect(unescapeKey(escapeKey('this.that.other'))).to.equal('this.that.other')
    //     })
    //
    //     it('should escape a key with a percent in it', () => {
    //         expect(escapeKey('this.that%.other')).to.equal('this%46that%37%46other');
    //         expect(unescapeKey(escapeKey('this.that%.other'))).to.equal('this.that%.other');
    //     })
    // });
    //

});

const getBaseMsg = (msg: DeepPartial<PeerPutMsg['payload']>): PeerPutMsg['payload'] => ({
    path: 'my-graph.my-path',
    value: 20,
    ...msg,
    meta: {
        owner: 'pubkey',
        sig: '',
        perms: 0o777,
        timestamp: getNetworkTime(),
        ...msg.meta
    }
});

// const writeValue = <P extends Pistol>(pistol: P, {
//     perms = 0o777,
//     path = 'my-graph.my-path',
//     value = 10
// }: {
//     perms?: number,
//     path?: string,
//     value?: any
// }) => of(pistol).pipe(
//     switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
//     switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', keys)),
//     switchMap(pistol => serializePubKey(pistol.keys.pubKey).pipe(
//         map(pubKeyHex => ({pubKeyHex, pistol}))
//     )),
//     map(({pistol, pubKeyHex}) => ({
//         pistol, msg: getBaseMsg({
//             path,
//             value,
//             meta: {
//                 owner: pubKeyHex,
//                 perms: perms
//             }
//         })
//     })),
//     switchMap(({pistol, msg}) => signMsg(pistol, msg)),
//     switchMap(msg => pistolLocalPut(pistol,  msg.path, msg.value, msg.meta)),
//     first()
// );
