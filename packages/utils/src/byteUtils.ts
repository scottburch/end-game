
const subtle = crypto.subtle;

export type Hex = string
export const hexToBytes = (h: Hex) => new Uint8Array(h.length/2)
    .map((_, n) => parseInt(h.substring(n * 2, (n * 2) + 2), 16));


export const bytesToHex = (bytes: Uint8Array) =>
    Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0')).join('')

export const textToBytes = (s: string) => new TextEncoder().encode(s);
export const bytesToText = (b: Uint8Array) => new TextDecoder().decode(b);




