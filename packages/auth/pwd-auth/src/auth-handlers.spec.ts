import {catchError, delay, first, firstValueFrom, of, switchMap, tap} from "rxjs";
import {graphWithAuth, graphWithUser} from "./test/testUtils.js";
import type {Props} from "@end-game/graph";
import {graphGet, graphPutNode, graphPutEdge, newGraphEdge} from "@end-game/graph";
import {expect} from "chai";
import {graphAuth, graphNewAuth} from "./user-auth.js";
import {newGraphNode} from "@end-game/graph";
import type {AuthNode, NodeWithSig} from "./auth-utils.js";

describe('auth handlers', function()  {
    this.timeout(60_000)

    it('should fail to put a value if no auth if no signature', (done) =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphPutNode(graph, newGraphNode('scott', 'person', {name: 'scott'}))),
            catchError(err => of(err.code).pipe(
                tap(err => err === 'NOT_LOGGED_IN' && done())
            ))
        ))
    );

    it('should fail to put a value if the signature does not validate', (done) => {
        firstValueFrom(graphWithAuth().pipe(
            tap(graph => graphPutNode(graph, {
                ...newGraphNode<AuthNode['props']>('scott', 'auth', {
                    pub: '',
                    enc: '',
                    priv: '',
                    salt: '',
                    username: 'scott'
                })
            }).subscribe()),
            tap(graph =>
                graphPutEdge(graph, newGraphEdge('person-scott', 'owned_by', 'person', 'scott', {})).subscribe()
            ),
            tap(graph =>
                graphPutNode(graph, {
                    ...newGraphNode('person', 'person', {}),
                    sig: new Uint8Array(Array(64))
                } as NodeWithSig<Props> satisfies NodeWithSig<Props>).pipe(
                    catchError(err => err.code === 'UNAUTHORIZED_USER' ? of(done()) : of(done('invalid error thrown ' + err)))
                ).subscribe()
            ),
        ))
    })

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

    it('should send a signed object to storage', () =>
        firstValueFrom(graphWithUser().pipe(
            switchMap(graph => graphPutNode(graph, newGraphNode('item', 'person', {name: 'scott'}))),
            switchMap(({graph}) => graphGet(graph, 'item')),
            tap(({node}) => expect((node as NodeWithSig<Props>).sig).not.to.be.undefined)
        ))
    );
});