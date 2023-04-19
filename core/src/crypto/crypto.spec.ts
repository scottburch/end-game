import {
    decrypt, deserializeKeys, deserializePubKey,
    encrypt,
    generateNewAccount, getId,
    serializeKeys, serializePubKey,
    signMsg, signRule, subtle,
    verify,
    verifyMsgSig
} from "./crypto.js";
import {
    combineLatest,
    firstValueFrom, last,
    map,
    mergeMap, of,
    range,
    switchMap,
    tap
} from "rxjs";
import {expect} from 'chai';
import {AuthenticatedEndgame, endgameLogin, newEndgame} from "../app/endgame.js";
import {PeerPutMsg} from "../p2p/peerMsg.js";
import {getNetworkTime} from "../graph/endgameGraph.js";
import {sign} from "./crypto.js";
import {bytesToText, textToBytes} from "../utils/byteUtils.js";
import {handlers} from "../handlers/handlers.js";
import {HandlerFn} from "../app/endgameConfig.js";
import {testLocalAuthedEndgame} from "../test/testUtils.js";
import {Rule} from "../app/rules.js";



describe('crypto', function () {
    this.timeout(20_000);


    describe('new tests', () => {
        describe('generateNewAccounts()', () => {
            it('should generate new keys and salt for each call', () =>
                firstValueFrom(combineLatest([
                    generateNewAccount(),
                    generateNewAccount()
                ]).pipe(
                    switchMap(([k1, k2]) => combineLatest([
                        serializeKeys(k1, 'my-pass'),
                        serializeKeys(k2, 'my-pass')
                    ])),
                    tap(([k1, k2]) => {
                        expect(k1.pub).not.to.equal(k2.pub);
                        expect(k1.priv).not.to.equal(k2.priv);
                        expect(k1.enc).not.to.equal(k2.enc);
                        expect(k1.salt).not.to.equal(k2.salt);
                    })
                ))
            )
        });


        describe('deserializePubKey()', () => {
            it('should be able to deserialize just the public key', () =>
                firstValueFrom(generateNewAccount().pipe(
                    switchMap(keys => sign(textToBytes('testing'), keys).pipe(map(sig => ({sig, keys})))),
                    switchMap(({sig, keys}) => serializeKeys(keys, 'my-pass').pipe(map(keys => ({sig, keys})))),
                    switchMap(({sig, keys}) => deserializePubKey(keys.pub).pipe(map(keys => ({sig, keys})))),
                    switchMap(({sig, keys}) => verify(textToBytes('testing'), sig, keys)),
                    tap(result => expect(result).to.be.true)
                ))
            )
        });

        describe('serializePubKey()', () => {
            it('should serialize a public key', () =>
                firstValueFrom(generateNewAccount().pipe(
                    switchMap(({pubKey}) => serializePubKey(pubKey).pipe(map(serPubKey => ({serPubKey, pubKey})))),
                    switchMap(({serPubKey, pubKey}) => deserializePubKey(serPubKey).pipe(map(pubKey2 => ({pubKey, pubKey2})))),
                    switchMap(({pubKey, pubKey2}) => combineLatest([
                        subtle.exportKey('raw', pubKey),
                        subtle.exportKey('raw', pubKey2)
                    ])),
                    tap(([key1, key2]) => expect(key1).to.deep.equal(key2))
                ))
            )
        });

        describe('encrypt/decrypt key', () => {
            it('should generate encryption keys for an account that can be serialized/deserialized', () =>
                firstValueFrom(generateNewAccount().pipe(
                        switchMap(keys => serializeKeys(keys, 'my-pass')),
                        switchMap(keys => deserializeKeys(keys, 'my-pass')),
                        switchMap(keys => encrypt(textToBytes('test enc'), keys).pipe(map(enc => ({keys, enc})))),
                        switchMap(({keys, enc}) => serializeKeys(keys, 'my-pass').pipe(map(keys => ({enc, keys})))),
                        switchMap(({keys, enc}) => deserializeKeys(keys, 'my-pass').pipe(map(keys => ({enc, keys})))),
                        switchMap(({keys, enc}) => decrypt(enc, keys).pipe(map(result => ({keys, result})))),
                        tap(({result}) => expect(bytesToText(result)).to.equal('test enc'))
                    )
                ));
        });

        describe('sign/verify key', () => {

            it('should be able to verify a value signed before keys serialized', () =>
                firstValueFrom(generateNewAccount().pipe(
                    switchMap(keys => serializeKeys(keys, 'my-pass')),
                    switchMap(keys => deserializeKeys(keys, 'my-pass')),
                    switchMap(keys => sign(textToBytes('testing'), keys).pipe(map(sig => ({keys, sig})))),
                    switchMap(({keys, sig}) => serializeKeys(keys, 'my-pass').pipe(map(keys => ({keys, sig})))),
                    switchMap(({keys, sig}) => deserializeKeys(keys, 'my-pass').pipe(map(keys => ({keys, sig})))),
                    switchMap(({keys, sig}) => verify(textToBytes('testing'), sig, keys.pubKey)),
                    tap(valid => expect(valid).to.be.true)
                ))
            );

            it('should be able to sign data using deserialized a private key', () =>
                firstValueFrom(generateNewAccount().pipe(
                    map(keysBefore => ({keysBefore})),
                    switchMap(({keysBefore}) => serializeKeys(keysBefore, 'my-pass').pipe(map(serKeys => ({
                        keysBefore,
                        serKeys
                    })))),
                    switchMap(({keysBefore, serKeys}) => deserializeKeys(serKeys, 'my-pass').pipe(map(keys => ({
                        keys,
                        keysBefore
                    })))),
                    switchMap(({keysBefore, keys}) => sign(textToBytes('testing'), keysBefore).pipe(map(sig => ({
                        sig,
                        keys
                    })))),
                    switchMap(({sig, keys}) => verify(textToBytes('testing'), sig, keys.pubKey)),
                    tap(result => expect(result).to.be.true)
                ))
            );
        });

        describe('getId()', () => {
            it('should return an id for a pubkey', () =>
                firstValueFrom(generateNewAccount().pipe(
                    switchMap(({pubKey}) => getId(pubKey)),
                    tap(id => {
                        expect(id).to.match(/^endgame/);
                        expect(id).to.have.length(66);
                    })
                ))
            )
        })
    });

    describe('signing messages', () => {
        it('should sign quickly', () =>
            firstValueFrom(newEndgame({handlers: {login: handlers([testAuthHandler])}}).pipe(
                switchMap(endgame => getTestKeys().pipe(map(keys => ({keys, endgame})))),
                switchMap(({keys, endgame}) => endgameLogin(endgame, 'username', 'password', 'my.user')),
                switchMap(({endgame}) => range(1, 500).pipe(
                    mergeMap(() => signMsg((endgame as AuthenticatedEndgame), {
                        path: 'xx.yy',
                        meta: {ownerPath: 'my.user' , sig: '', state: getNetworkTime().toString(), rules: []},
                        value: 'x'.repeat(200)
                    })),

                    last()
                ))
            ))
        );

        it('should sign a msg if endgame is setup in untrusted mode', () =>
            firstValueFrom(newEndgame({handlers: {login: handlers([testAuthHandler])}}).pipe(
                switchMap(endgame => getTestKeys().pipe(map(keys => ({endgame, keys})))),
                switchMap(({endgame, keys}) => endgameLogin(endgame, 'my-username', 'password', 'my.user')),
                switchMap(({endgame}) => serializePubKey((endgame as AuthenticatedEndgame).keys.pubKey).pipe(map(serPubKey => ({endgame, serPubKey})))),
                map(({endgame, serPubKey}) => ({
                    endgame, msg: {
                        graphId: 'my-graph',
                        path: 'my-path',
                        value: 10,
                        meta: {
                            state: getNetworkTime().toString(),
                            ownerPath: 'my.user',
                            sig: '',
                            rules: []
                        }
                    } as PeerPutMsg['payload']
                })),
                switchMap(({endgame, msg}) => signMsg((endgame as AuthenticatedEndgame), msg)),
                tap(msg => expect(msg.meta.sig).to.have.length(128))
            ))
        );

        it('should allow a trusted node', () =>
            firstValueFrom(newEndgame({isTrusted: true, handlers: {login: handlers([testAuthHandler])}}).pipe(
                switchMap(endgame => endgameLogin(endgame, 'my-username', 'password', 'my.user')),
                map(({endgame}) => endgame as AuthenticatedEndgame),
                map((endgame) => ({
                    endgame, msg: {
                        graphId: 'my-graph',
                        path: 'my-path',
                        value: 10,
                        meta: {
                            state: getNetworkTime().toString(),
                            ownerPath: 'my.user',
                            sig: '',
                            rules: []
                        }
                    } as PeerPutMsg['payload']
                })),
                switchMap(({endgame, msg}) => signMsg((endgame as AuthenticatedEndgame), msg).pipe(
                    map(msg => ({msg, endgame}))
                )),
                tap(({msg}) => expect(msg.meta.sig).to.equal('')),
                switchMap(({msg, endgame}) => verifyMsgSig(msg, endgame.keys.pubKey)),
                tap(valid => expect(valid).to.be.true)
            ))
        );

        it('should sign and verify a message', () =>
            firstValueFrom(newEndgame({isTrusted: true, handlers: {login: handlers([testAuthHandler])}}).pipe(
                switchMap(endgame => endgameLogin(endgame, 'my-username', 'password', 'my.user')),
                map(({endgame}) => endgame as AuthenticatedEndgame),
                map(endgame => ({
                    endgame, msg: {
                        graphId: 'my-graph',
                        path: 'my-path',
                        value: 10,
                        meta: {
                            state: getNetworkTime().toString(),
                            ownerPath: 'my.path',
                            sig: '',
                            rules: []
                        }
                    } as PeerPutMsg['payload']
                })),
                switchMap(({endgame, msg}) => signMsg((endgame as AuthenticatedEndgame), msg).pipe(
                    map(msg => ({endgame, msg}))
                )),
                switchMap(({msg, endgame}) => verifyMsgSig(msg, endgame.keys.pubKey)),
                tap(valid => expect(valid).to.be.true)
            ))
        );
    });

    describe('rules', () => {
        it('should sign a rule', () =>
            firstValueFrom(testLocalAuthedEndgame().pipe(
                map(endgame => ({endgame, rule: {
                    reader: 'reader',
                        writer: 'writer',
                        ownerPath: 'my.user',
                        sig: ''
                    } as Rule})),
                switchMap(({rule, endgame}) => signRule(rule, endgame.keys.privKey)),
                tap(rule => {
                    expect(rule.reader).to.equal('reader');
                    expect(rule.writer).to.equal('writer');
                    expect(rule.ownerPath).to.equal('my.user');
                    expect(rule.sig).to.have.length(128)
                })
            ))
        )
    })

});

export const testAuthHandler: HandlerFn<'login'> =
    ({endgame, password, userPath, username}) => getTestKeys().pipe(
        map(keys => ({...endgame, keys, username, userPath} satisfies AuthenticatedEndgame as AuthenticatedEndgame)),
        map(endgame => ({endgame, password, userPath, username}))
    )

export const getTestKeys = () =>of({
    "pub": "MDRhY2ZhZTJhNDBkMzQxN2E4MDVlNWE2YWRmYzMzZGI5YTA3N2IzNGI0YmNkYTNkMmYxYWVhNDFmMjg0YWQzYTc3ZWIzYTZjNzgxZTE2OGFjNmE3YTI0YTVkMTdhZGFiM2I4YzU5MmQ1N2M0NWM4YmNmMjk0OGQ0MWU2YjBlNGNhMg==",
    "priv": "NmNkMzUzZGQwMmE1NTIyOTcwMDA5MWNkYzY3NWY5YzNkZGY3OTdlYmFhZDJjN2U1YzVkZjk0ODM3YzRhNjg0MTgzODM5M2QzZjE4YjUyYzZjYjQ5MzMwNzk4M2RhMGRkYTEyZTFmZjA0NzI4YWUwYTA3MjE2ZjI4ZjQ2MGY5OGJkZTc0MGM5MjI5ZDEzYTY3NGEwYzQ5MWUzMWNmODQ2ZDNjMjk4N2QzMGE2YmYzZWE0OWE5YzE4MTdlZjhjY2MwZmUwNDk3MzE1ZDIzYjVlNTlkMjA5ZjZhNzcyOGUxZmJmYWRjZmQ4YTViZDNjZDVmNDJlMWRjNGQ5OGY1NWM4NTVhNDRhNGYyNmU0MDQ5ZDJlYzkwZjk3MzM5ZGZlNTNi",
    "enc": "OTY3OWZlNDVmNWYxYjE3ZWRmYzM5OWU2NmYwNzUzZWZiMzA3NmE4MDBkZDBkYzE2NTBhNTFkYmI2ZjQ0ZmE5MjZmNTEyNjNkMDgwMzg5NDMzOTkwODI3MTBmM2ExODBk",
    "salt": "NjQzMDM4Mzg2NjY0NjUzNjM1MzgzMTYxMzQzODMxNjQ="
}).pipe(
    switchMap(serKeys => deserializeKeys(serKeys, 'my-pass'))
);
