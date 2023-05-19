import {cloudServerHandlers} from "./cloudServer.js";
import {graphOpen, graphPutNode, levelStoreHandlers, nodesByLabel} from "@end-game/graph";
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
            ),
            graphOpen().pipe(
                switchMap(graph => cloudClientHandlers(graph, {url: 'ws://localhost:11111'})),
                switchMap(graph => authHandlers(graph)),
                switchMap(graph => levelStoreHandlers(graph))
            )
        ]).pipe(
            switchMap(([server, client1, client2]) => of({server, client1, client2}).pipe(
                switchMap(() => graphNewAuth(client1, 'scott', 'pass')),
                switchMap(() => graphAuth(client1, 'scott', 'pass')),
                switchMap(() => graphPutNode(client1, 'me', 'person', {name:'scott'})),

                switchMap(() => nodesByLabel(client1, 'auth')),
                filter(({nodes}) => !!nodes.length),
                tap(({nodes}) => expect(nodes[0].props.username).to.equal('scott')),

                switchMap(() => nodesByLabel(server, 'auth')),
                filter(({nodes}) => !!nodes.length),
                tap(({nodes}) => expect(nodes[0].props.username).to.equal('scott')),

                switchMap(() => nodesByLabel(client2, 'auth')),
                filter(({nodes}) => !!nodes.length),
                tap(({nodes}) => expect(nodes[0].props.username).to.equal('scott'))

                // TODO: Fix this test by fixing auth handler - it does not handle puts that are not yours, so the server errors out
            )),
        ))
    );
});