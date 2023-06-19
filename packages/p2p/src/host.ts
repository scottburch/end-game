import {GraphWithP2p, PeerId} from "./p2pHandlers.js";

export type Host = {
    listeningPort: number,
    graphs: GraphWithP2p[],
    hostId: PeerId
}

export type HostProps = Host

export const newHost = (props: HostProps) => props as Host;