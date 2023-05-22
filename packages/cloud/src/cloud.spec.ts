import {graphGet, graphPutNode, newGraphNode} from "@end-game/graph";
import {delay, filter, firstValueFrom, of, switchMap, tap} from "rxjs";
import {graphAuth, graphNewAuth} from "@end-game/auth";
import {startTestNet} from "./test/testUtils.js";
import {expect} from "chai";

describe('cloud', () => {
    it('should send puts to the server', () =>
        firstValueFrom(startTestNet().pipe(
            switchMap(([server, client]) => of({server, client}).pipe(
                switchMap(() => graphNewAuth(client, 'scott', 'pass')),
                switchMap(() => graphAuth(client, 'scott', 'pass')),
                switchMap(() => graphPutNode(client, newGraphNode('me', 'person', {name:'scott'}))),
                switchMap(() => graphGet(server, 'me')),
                filter(({node}) => !!node?.nodeId),
                tap(({node}) => expect(node.props.name).to.equal('scott'))
            ))
        ))
    );

    it('should allow clients to pull data', () =>
        firstValueFrom(startTestNet().pipe(
            switchMap(([server, client1, client2]) => of({server, client1, client2}).pipe(
                switchMap(() => graphNewAuth(client1, 'scott', 'pass')),
                switchMap(() => graphAuth(client1, 'scott', 'pass')),
                switchMap(() => graphPutNode(client1, newGraphNode('me', 'person', {name:'scott'}))),
                switchMap(() => graphGet(server, 'me')),
                filter(({node}) => !!node?.nodeId),
                tap(({node}) => expect(node.props.name).to.equal('scott')),
                // TODO: finish here
                delay(1000),
                switchMap(() => graphGet(client2, 'me')),
                tap(({node}) => console.log(node))
            ))
        ))
    )
});