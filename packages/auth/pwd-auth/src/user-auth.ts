import type {Graph} from "@end-game/graph";
import {asNodeId, putNode} from "@end-game/graph";
import {deserializeKeys, generateNewAccount, serializeKeys} from "@end-game/crypto";
import {catchError, iif, map, of, switchMap, tap, throwError} from "rxjs";
import type {AuthNode} from "./auth-utils.js";
import {asGraphWithAuth, findAuthNode} from "./auth-utils.js";
import {chainNext} from "@end-game/rxjs-chain";
import {newNode} from "@end-game/graph";

export const graphNewAuth = (graph: Graph, username: string, password: string) =>
    generateNewAccount().pipe(
        switchMap(keys => serializeKeys(keys, password)),
        switchMap(keys => putNode(graph, newNode(asNodeId(''), 'auth', {...keys, username}) satisfies AuthNode)),
    );

export const graphAuth = (graph: Graph, username: string, password: string) =>
    findAuthNode(graph, username).pipe(
        switchMap(({graph, node}) => iif(() => !!node.nodeId, of({node}).pipe(
            map(({node}) => ({nodeId: node.nodeId, auth: node.props})),
            switchMap(({nodeId, auth}) => iif(
                () => !!(auth).pub,
                deserializeKeys(auth, password).pipe(
                    map(auth => ({nodeId, auth, username}))
                ),
                of(undefined)
            )),
            tap(u => (asGraphWithAuth(graph)).user = u),
            map(() => ({graph: asGraphWithAuth(graph)})),
            tap(({graph}) => chainNext(graph.chains.authChanged, {graph}).subscribe()),
            catchError(err => err.cause.message.includes('bad decrypt') ? of({graph: asGraphWithAuth(graph)}) : throwError(() => err))
        ), of({graph: asGraphWithAuth(graph), node}))),
    );

export const graphUnauth = (graph: Graph) => of(graph).pipe(
    tap((asGraphWithAuth(graph)).user = undefined),
    tap(graph => chainNext((asGraphWithAuth(graph)).chains.authChanged, {graph}).subscribe()),
    map(() => ({graph}))
);
