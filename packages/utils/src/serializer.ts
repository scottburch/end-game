import {bytesToHex, hexToBytes} from "./byteUtils.js";

const serReplacer = (k: any, v: any) =>
    v instanceof Uint8Array ? `0x${bytesToHex(v)}` : v;

const deserReplacer = (k: string, v: any) =>
    typeof v === 'string' && v.startsWith('0x') ? hexToBytes(v.replace('0x', '')) : v


export const serializer = (obj: any) => JSON.stringify(obj, serReplacer);

export const deserializer = <T>(str: string) => JSON.parse(str, deserReplacer) as T;