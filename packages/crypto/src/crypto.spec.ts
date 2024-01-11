import {
    decrypt,
    deserializeKeys,
    deserializePubKey,
    encrypt,
    generateNewAccount,
    getId, hashData,
    serializeKeys,
    serializePubKey,
    sign,
    subtle,
    verify
} from "./crypto.js";
import {combineLatest, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {expect} from 'chai';
import {bytesToHex, bytesToText, textToBytes} from "@end-game/utils/byteUtils";


describe('crypto', function () {
    this.timeout(20_000);

    describe('hashData()', () => {
       it('should hash a piece of data', () =>
        firstValueFrom(of(new TextEncoder().encode('somestring'.repeat(50))).pipe(
            switchMap(hashData),
            map(bytesToHex),
            tap(hex => expect(hex).to.equal('042efe4df8aa2c84704844ce888ea27d3d5b1623'))

        ))
       )
    });

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
                    switchMap(({serPubKey, pubKey}) => deserializePubKey(serPubKey).pipe(map(pubKey2 => ({
                        pubKey,
                        pubKey2
                    })))),
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
                        expect(id).to.match(/^eg/);
                        expect(id).to.have.length(61);
                    })
                ))
            )
        })
});

