import {from, last, mergeMap} from "rxjs";
import {PistolGraphValue, putPistolValue} from "@scottburch/pistol";



export const reachKey = (key: string) => `reachv4.${key}`;
export const reachIdxKey = (key: string) => `reachv4.idx.${key}`;

export const pistolWriteObj = <T extends Record<string, PistolGraphValue>>(base: string, obj: T) =>
    from(Object.keys(obj)).pipe(
        mergeMap(key => putPistolValue(`${base}.${key}`, obj[key])),
        last()
    )