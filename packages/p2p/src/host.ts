import {GraphWithP2p, PeerId} from "./p2pHandlers.js";
import {Subject} from "rxjs";
import {LogLevel} from "@end-game/graph";

export type LogEntry = {
    code: string,
    text: string,
    level: LogLevel
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