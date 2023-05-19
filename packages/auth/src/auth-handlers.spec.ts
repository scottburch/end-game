import {catchError, first, firstValueFrom, of, switchMap, tap} from "rxjs";
import {graphWithAuth, graphWithUser} from "./test/testUtils.js";
import {graphGet, graphPutNode, graphPutEdge, newGraphEdge} from "@end-game/graph";
import {expect} from "chai";
import {graphAuth, graphNewAuth} from "./user-auth.js";
import {newGraphNode} from "@end-game/graph";

describe('auth handlers', function()  {
    this.timeout(60_000)

    it('should fail to put a value if no auth', (done) =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphPutNode(graph, newGraphNode('scott', 'person', {name: 'scott'}))),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'NOT_LOGGED_IN' && done())
            ))
        ))
    );

    it('should put a value in the store if correct user is logged in', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphPutNode(graph, newGraphNode('item', 'person', {name: 'scott'}))),
            switchMap(({graph, nodeId}) => graphGet(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('scott'))
        ))
    );

    it('will allow the authorized user to update a value', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphPutNode(graph, newGraphNode('item', 'person', {name: 'joe'}))),
            switchMap(({graph}) => graphGet(graph, 'item').pipe(first())),
            tap(({node}) => expect(node.props.name).to.equal('joe')),
            switchMap(({graph}) => graphPutNode(graph, newGraphNode('item', 'person', {name: 'scott'}))),
            switchMap(({graph}) => graphGet(graph, 'item')),
            tap(({node}) => expect(node.props.name).to.equal('scott'))
        ))
    );

    it('will not put a value in the store if the wrong user is logged in', (done) => {
        firstValueFrom(graphWithUser().pipe(
            switchMap(graph => graphPutNode(graph, newGraphNode('item', 'person', {name: 'scott'}))),
            switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
            switchMap(({graph}) => graphPutNode(graph, newGraphNode('item', 'person', {name: 'todd'}))),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
            ))
        ))
    });

    it('should not allow you to add an edge if you are not logged in', (done) => {
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphPutEdge(graph, newGraphEdge('my-edge', 'rel', 'from', 'to', {}))),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'NOT_LOGGED_IN' ? done() : done(`wrong error thrown: ${err}`))
            ))
        ))
    })

});