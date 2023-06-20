import {GraphWithP2p, PeerId} from "./p2pHandlers.js";
import {Subject} from "rxjs";

export type LogEntry<T = any> = {
    code: string,
    data: T
}

export type Host = {
    listeningPort: number,
    graphs: GraphWithP2p[],
    hostId: PeerId,
    log: Subject<LogEntry>
}

export type HostProps = Host

export const newHost = (props: Omit<HostProps, 'log'>) => ({
    ...props,
    log: new Subject()
} as Host)