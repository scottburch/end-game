import {combineLatest, from, map, of, switchMap} from "rxjs";
import {bytesToHex, hexToBytes, textToBytes} from "@end-game/utils/byteUtils";
import {default as Base64} from 'base-64'
import {bech32} from 'bech32'


export const subtle = crypto.subtle;


export type KeyBundle = {
    pubKey: CryptoKey
    privKey: CryptoKey
    encKey: CryptoKey
    salt: Uint8Array
};

export type EncryptedKeyBundle = {
    pub: string
    priv: string
    enc: string
    salt: string
}

const passwdToKey = (passwd: string, salt: Uint8Array) =>
    of(passwd).pipe(
        map(passwd => textToBytes(passwd)),
        switchMap(passwd => subtle.importKey('raw', passwd, 'PBKDF2', false, ['deriveBits'])),
        map(importedKey => ({
            importedKey,
            params: {
                name: "PBKDF2",
                hash: 'SHA-256',
                salt,
                iterations: 65000
            } as Pbkdf2Params
        })),
        switchMap(({importedKey, params}) => subtle.deriveBits(params, importedKey, 128 * 8)),
        switchMap(keyBits => subtle.importKey('raw', keyBits.slice(0, 32), {name: 'AES-CBC'}, false, ['encrypt', 'decrypt'])),
    );


export const generateNewAccount = () =>
    combineLatest([
        subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']),
        subtle.generateKey({name: 'AES-CBC', length: 256}, true, ['encrypt', 'decrypt'])
    ]).pipe(
        map(([signKey, encKey]) => ({
            pubKey: signKey.publicKey,
            privKey: signKey.privateKey,
            encKey,
            salt: textToBytes(crypto.randomUUID().replace(/-/g, '').slice(0, 16))
        })),
    );

export const sign = (data: Uint8Array, keys: KeyBundle) =>
    from(subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, keys.privKey, data)).pipe(
        map(sig => new Uint8Array(sig))
    );

export const verify = (data: Uint8Array, sig: Uint8Array, pubKey: CryptoKey) =>
    from(subtle.verify({name: 'ECDSA', hash: 'SHA-256'}, pubKey, sig, data));

export const encrypt = (data: Uint8Array, keys: KeyBundle) =>
    from(subtle.encrypt({name: 'AES-CBC', iv: keys.salt}, keys.encKey, data)).pipe(
        map(enc => new Uint8Array(enc))
    );

export const decrypt = (data: Uint8Array, keys: KeyBundle) =>
    from(subtle.decrypt({name: 'AES-CBC', iv: keys.salt}, keys.encKey, data)).pipe(
        map(result => new Uint8Array(result))
    );

export const serializeKeys = (keys: KeyBundle, passwd: string) =>
    combineLatest([
        subtle.exportKey('raw', keys.pubKey),
        subtle.exportKey('jwk', keys.privKey),
        subtle.exportKey('jwk', keys.encKey),
        of(keys.salt)
    ]).pipe(
        map(([pubKey, privKey, encKey, salt]) => ({pubKey, privKey, encKey, salt})),
        switchMap((keys: { pubKey: ArrayBuffer, privKey: JsonWebKey, encKey: JsonWebKey, salt: Uint8Array }) => of({
            pub: keys.pubKey,
            priv: `${keys.privKey.x}.${keys.privKey.y}.${keys.privKey.d}`,
            enc: keys.encKey.k || '',
            salt: keys.salt
        })),
        switchMap(keys => passwdToKey(passwd, keys.salt).pipe(map(passKey => ({passKey, keys})))),
        switchMap(({passKey, keys}) => combineLatest([
            of(keys.pub),
            subtle.encrypt({name: 'AES-CBC', iv: keys.salt}, passKey, textToBytes(keys.priv)),
            subtle.encrypt({name: 'AES-CBC', iv: keys.salt}, passKey, textToBytes(keys.enc)),
            of(keys.salt)
        ])),
        map(([pub, priv, enc, salt]) => ({
            pub: Base64.encode(bytesToHex(new Uint8Array(pub))),
            priv: Base64.encode(bytesToHex(new Uint8Array(priv))),
            enc: Base64.encode(bytesToHex(new Uint8Array(enc))),
            salt: Base64.encode(bytesToHex(salt))
        })),
    );

export const deserializePubKey = (pub: string) =>
    of(pub).pipe(
        map(Base64.decode),
        map(hexToBytes),
        switchMap(pubKey => subtle.importKey('raw', pubKey, {name: 'ECDSA', namedCurve: 'P-256'}, true, ['verify'])),
    );

export const serializePubKey = (pubKey: CryptoKey) =>
    of(pubKey).pipe(
        switchMap(pubKey => subtle.exportKey('raw', pubKey)),
        map(rawKey => bytesToHex(new Uint8Array(rawKey))),
        map(pubHex => Base64.encode(pubHex))
    )

export const deserializeKeys = (keys: EncryptedKeyBundle, passwd: string) =>
    of(keys).pipe(
        map(keys => ({
            pub: hexToBytes(Base64.decode(keys.pub)),
            priv: hexToBytes(Base64.decode(keys.priv)),
            enc: hexToBytes(Base64.decode(keys.enc)),
            salt: hexToBytes(Base64.decode(keys.salt))
        })),
        switchMap(keys => passwdToKey(passwd, keys.salt).pipe(map(passKey => ({keys, passKey})))),
        switchMap(({keys, passKey}) => combineLatest([
            subtle.importKey('raw', keys.pub, {name: 'ECDSA', namedCurve: 'P-256'}, true, ['verify']),
            subtle.decrypt({name: 'AES-CBC', iv: keys.salt}, passKey, keys.priv)
                .then(x => new TextDecoder().decode(x))
                .then(x => x.split('.'))
                .then(([x, y, d]) => ({
                    key_ops: ["sign"],
                    ext: true,
                    kty: "EC",
                    x, y, d,
                    "crv": "P-256",
                }))
                .then(x => subtle.importKey('jwk', x, {name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign']))
            ,
            subtle.decrypt({name: 'AES-CBC', iv: keys.salt}, passKey, keys.enc)
                .then(x => new TextDecoder().decode(x))
                .then(k => ({
                    key_ops: ["encrypt", "decrypt"],
                    ext: true,
                    kty: "oct",
                    k,
                    alg: "A256CBC"
                }))
                .then(x => subtle.importKey('jwk', x, {name: 'AES-CBC', length: 256}, true, ['encrypt', 'decrypt']))
            ,
            of(keys.salt)
        ])),
        map(([pubKey, privKey, encKey, salt]) => ({
            pubKey,
            privKey,
            encKey,
            salt
        } satisfies KeyBundle as KeyBundle)),
    );

export const getId = (pubKey: CryptoKey) =>
    from(subtle.exportKey('raw', pubKey)).pipe(
        map(pubKeyRaw => new Uint8Array(pubKeyRaw).slice(0, 32)),
        map(pubKeySlice => bech32.toWords(pubKeySlice)),
        map(words => bech32.encode('eg', words)),
    );
