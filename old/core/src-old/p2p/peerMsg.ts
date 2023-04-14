import {EndgameGraphMeta, EndgameGraphValue} from "../graph/endgameGraph";
import {AbstractKeyIteratorOptions} from "abstract-level";
import {Endgame} from "../app/endgame";

export const newPeerMsg = <T extends PeerMsg<any, any>>(pistol: Endgame, msg: Omit<T, 'from'>) => ({
    from: pistol.id,
    ...msg
} satisfies PeerMsg<T['cmd'], T['payload']>);



export type PeerMsg<Cmd, T> = {
    from: string
    cmd: Cmd
    payload: T
    forward: boolean
};

export type PeerPutMsg = PeerMsg<'put', {
    path: string,
    value: EndgameGraphValue,
    meta: EndgameGraphMeta,
}>;

export type PeerReadMsg = PeerMsg<'read', {
    path: string,
    timestamp: number
}>

export type PeerKeysMsg = PeerMsg<'keys', {
    base: string,
    timestamp: number,
    options: AbstractKeyIteratorOptions<string>
}>

export type PeerAnnounceMsg = PeerMsg<'announce', {
    peerId: string
}>

export type DupConnMsg = PeerMsg<'dup-connection', {}>



