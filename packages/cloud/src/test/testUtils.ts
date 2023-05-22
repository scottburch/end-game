import {combineLatest, switchMap} from "rxjs";
import {graphOpen, levelStoreHandlers} from "@end-game/graph";
import {cloudServerHandlers} from "../cloudServer.js";
import {authHandlers} from "@end-game/auth";
import {cloudClientHandlers} from "../cloudClient.js";

export const startTestNet = () => combineLatest([
    graphOpen({graphId: 'server'}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => cloudServerHandlers(graph, {port: 11111})),
    ),
    graphOpen({graphId: 'client1'}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => cloudClientHandlers(graph, {url: 'ws://localhost:11111'})),
    ),
    graphOpen({graphId: 'client2'}).pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph => authHandlers(graph)),
        switchMap(graph => cloudClientHandlers(graph, {url: 'ws://localhost:11111'})),
    )
])