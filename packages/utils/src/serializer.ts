const serReplacer = (k: any, v: any) =>
    v instanceof Uint8Array ? `B:${JSON.stringify(Array.from(v))}` : v;

const deserReplacer = (k: string, v: any) =>
    typeof v === 'string' && v.startsWith('B:') ? new Uint8Array(JSON.parse(v.replace('B:', ''))) : v


export const serializer = (obj: any) => JSON.stringify(obj, serReplacer);

export const deserializer = (str: string) => JSON.parse(str, deserReplacer);