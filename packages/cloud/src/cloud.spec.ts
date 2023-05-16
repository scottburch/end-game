import {cloudServerHandlers} from "./cloudServer.js";
import {graphOpen, graphPut, levelStoreHandlers, nodesByLabel} from "@end-game/graph";
import {combineLatest, filter, firstValueFrom, of, switchMap, tap} from "rxjs";
import {cloudClientHandlers} from "./cloudClient.js";
import {authHandlers, graphAuth, graphNewAuth} from "@end-game/auth";
import {expect} from "chai";

describe('cloud', () => {
    it('should send puts to the server', () =>
        firstValueFrom(combineLatest([
            graphOpen().pipe(
                switchMap(graph => cloudServerHandlers(graph, {port: 11111})),
                switchMap(graph => authHandlers(graph)),
                switchMap(graph => levelStoreHandlers(graph))
            ),
            graphOpen().pipe(
                switchMap(graph => cloudClientHandlers(graph, {url: 'ws://localhost:11111'})),
                switchMap(graph => authHandlers(graph)),
                switchMap(graph => levelStoreHandlers(graph))
            )
        ]).pipe(
            switchMap(([serverGraph, clientGraph]) => of({serverGraph, clientGraph}).pipe(
                switchMap(() => graphNewAuth(clientGraph, 'scott', 'pass')),
                switchMap(() => graphAuth(clientGraph, 'scott', 'pass')),
                switchMap(() => graphPut(clientGraph, 'me', 'person', {name:'scott'})),

                switchMap(() => nodesByLabel(clientGraph, 'auth')),
                filter(({nodes}) => !!nodes.length),
                tap(({nodes}) => expect(nodes[0].props.username).to.equal('scott')),

                switchMap(() => nodesByLabel(serverGraph, 'auth')),
                filter(({nodes}) => !!nodes.length),
                tap(({nodes}) => expect(nodes[0].props.username).to.equal('scott')),
            )),
        ))
    );
});