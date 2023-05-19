import type {Graph} from "@end-game/graph";
import {graphPutNode} from "@end-game/graph";
import type {EncryptedKeyBundle} from "@end-game/crypto";
import {deserializeKeys, generateNewAccount, serializeKeys} from "@end-game/crypto";
import {catchError, iif, map, of, switchMap, tap, throwError} from "rxjs";
import type {GraphWithAuth} from "./auth-utils.js";
import {findAuthNode} from "./auth-utils.js";
import {chainNext} from "@end-game/rxjs-chain";

export const graphNewAuth = (graph: Graph, username: string, password: string) =>
    generateNewAccount().pipe(
        switchMap(keys => serializeKeys(keys, password)),
        switchMap(keys => graphPutNode(graph, '', 'auth', {...keys, username})),
    );

export const graphAuth = (graph: Graph, username: string, password: string) =>
    findAuthNode(graph, username).pipe(
        switchMap(({graph, node}) => iif(() => !!node.nodeId, of({node}).pipe(
            map(({node}) => ({nodeId: node.nodeId, auth: node.props})),
            switchMap(({nodeId, auth}) => iif(
                () => !!(auth as EncryptedKeyBundle).pub,
                deserializeKeys(auth as EncryptedKeyBundle, password).pipe(
                    map(auth => ({nodeId, auth, username}))
                ),
                of(undefined)
            )),
            tap(u => (graph as GraphWithAuth).user = u),
            map(() => ({graph: graph as GraphWithAuth})),
            tap(({graph}) => chainNext(graph.chains.authChanged, {graph}).subscribe()),
            catchError(err => err.cause.message.includes('bad decrypt') ? of({graph: graph as GraphWithAuth}) : throwError(() => err))
        ), of({graph: graph as GraphWithAuth, node}))),
    );

export const graphUnauth = (graph: Graph) => of(graph).pipe(
    tap((graph as GraphWithAuth).user = undefined),
    tap(graph => chainNext((graph as GraphWithAuth).chains.authChanged, {graph}).subscribe()),
    map(() => ({graph}))
);
