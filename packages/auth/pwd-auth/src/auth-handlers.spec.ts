import {catchError, first, firstValueFrom, of, switchMap, tap} from "rxjs";
import {graphWithAuth, graphWithUser} from "./test/testUtils.js";
import {getNode, putEdge, putNode, newGraphEdge, newNode, nodeId} from "@end-game/graph";
import {expect} from "chai";
import {graphAuth, graphNewAuth} from "./user-auth.js";
import type {NodeWithAuth} from "./auth-utils.js";
import {addThingNode} from "@end-game/test-utils";

describe('auth handlers', function()  {
    this.timeout(60_000)

    it('should fail to put a node if no auth and no signature', (done) =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => addThingNode(graph, 1)),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'NOT_LOGGED_IN' && done())
            ))
        ))
    );

    it('should fail to put an edge if no auth and no signature', (done) =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => putEdge(graph, newGraphEdge('edge1', 'rel', nodeId('from'), nodeId('to'), {}))),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'NOT_LOGGED_IN' && done())
            ))
        ))
    )


    it('should put a value in the store if correct user is logged in', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => putNode(graph, newNode(nodeId('item'), 'person', {name: 'scott'}))),
            switchMap(({graph, nodeId}) => getNode(graph, nodeId, {})),
            tap(({node}) => expect(node.props.name).to.equal('scott'))
        ))
    );

    it('will allow the authorized user to update a value', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => putNode(graph, newNode(nodeId('item'), 'person', {name: 'joe'}))),
            switchMap(({graph}) => getNode(graph, nodeId('item'), {}).pipe(first())),
            tap(({node}) => expect(node.props.name).to.equal('joe')),
            switchMap(({graph}) => putNode(graph, newNode(nodeId('item'), 'person', {name: 'scott'}))),
            switchMap(({graph}) => getNode(graph, nodeId('item'), {})),
            tap(({node}) => expect(node.props.name).to.equal('scott'))
        ))
    );

    it('will not put a value in the store if the wrong user is logged in', (done) => {
        firstValueFrom(graphWithUser().pipe(
            switchMap(graph => putNode(graph, newNode(nodeId('item'), 'person', {name: 'scott'}))),
            switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
            switchMap(({graph}) => putNode(graph, newNode(nodeId('item'), 'person', {name: 'todd'}))),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
            ))
        ))
    });

    it('should send a signed object to storage', () =>
        firstValueFrom(graphWithUser().pipe(
            switchMap(graph => putNode(graph, newNode(nodeId('item'), 'person', {name: 'scott'}))),
            switchMap(({graph}) => getNode(graph, nodeId('item'), {})),
            tap(({node}) => expect((node as NodeWithAuth).sig).not.to.be.undefined)
        ))
    );
});