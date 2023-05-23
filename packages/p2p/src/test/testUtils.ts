import {combineLatest, switchMap} from "rxjs";
import {graphOpen, levelStoreHandlers} from "@end-game/graph";
import {authHandlers} from "@end-game/auth";
import {p2pHandlers} from "../p2pHandlers.js";

export const startTestNet = () => combineLatest([
    graphOpen({graphId: 'server'}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => p2pHandlers(graph, {listeningPort: 11110, peerId: 'server'})),
    ),
    graphOpen({graphId: 'client1'}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => p2pHandlers(graph, {listeningPort: 11111, peerId: 'client1'})),
    ),
    graphOpen({graphId: 'client2'}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => p2pHandlers(graph, {listeningPort: 11112, peerId: 'client2'})),
    )
])