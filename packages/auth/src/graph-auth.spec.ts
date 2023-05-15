import {catchError, first, firstValueFrom, of, switchMap, tap} from "rxjs";
import type {GraphWithUser} from './graph-auth.js'
import {graphAuth, graphNewAuth, graphUnauth} from "./graph-auth.js";

import {expect} from 'chai'
import {graphWithAuth} from "./test/testUtils.js";
import {graphGet, graphPut, graphPutEdge} from "@end-game/graph";


describe('graph auth', () => {
    it('should return undefined if a user does not exist', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphAuth(graph, 'scott', 'pass')),
            tap(({graph}) => expect(graph.user).to.be.undefined)
        ))
    );

    it('should allow a user to signup for an account', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            tap(({graph}) => expect(graph.user?.auth).to.have.property('pubKey')),
        ))
    );

    it('should error if a user tries to sign up twice', (done) => {
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            tap(({nodeId}) => expect(nodeId).to.have.length(12)),
            switchMap(({graph}) => graphNewAuth(graph, 'scott', 'pass')),
            catchError(err => of(err).pipe(
                tap(() => err === 'USER_ALREADY_EXISTS' ? done() : done('invalid error message'))
            ))
        ))
    })

    it('should return undefined user if auth failed', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott','pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'wrong')),
            tap(badAuth => {
                expect(badAuth.graph.user).to.be.undefined;
            })
        ))
    );

    it('should set the graph user to undefined if unauth called', () => {
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
            tap(({graph}) => expect(graph.user?.nodeId).to.have.length(12)),
            switchMap(({graph}) => graphUnauth(graph)),
            tap(({graph}) => expect((graph as GraphWithUser).user).to.be.undefined)

        ))
    })

    describe('auth handlers', () => {
        it('should require an auth to put a value', (done) =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphPut(graph, 'scott', 'person', {name: 'scott'})),
                catchError(err => of(err).pipe(
                    tap(err => err === 'NOT_LOGGED_IN' && done())
                ))
            ))
        );

        it('should put a value in the store if correct user is logged in', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'pass' )),
                switchMap(({graph}) => graphPut(graph, 'item', 'person', {name: 'scott'})),
                switchMap(({graph, nodeId}) => graphGet(graph, nodeId)),
                tap(({node}) => expect(node.props.name).to.equal('scott'))
            ))
        );

        it('will allow the authorized user to update a value', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphPut(graph, 'item', 'person', {name: 'joe'})),
                switchMap(({graph}) => graphGet(graph, 'item').pipe(first())),
                tap(({node}) => expect(node.props.name).to.equal('joe')),
                switchMap(({graph}) => graphPut(graph, 'item', 'person', {name: 'scott'})),
                switchMap(({graph}) => graphGet(graph, 'item')),
                tap(({node}) => expect(node.props.name).to.equal('scott'))
            ))
        );

        it('will not put a value in the store if the wrong user is logged in', (done) => {
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphPut(graph, 'item', 'person', {name: 'scott'})),
                switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphPut(graph, 'item', 'person', {name: 'todd'})),
                catchError(err => of(err).pipe(
                    tap(() => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
                ))
            ))
        });

        it('should not allow you to add a edge "from" a node you do not own', (done) => {
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => graphPut(graph, 'item', 'person', {})),
                switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphPutEdge(graph, 'edge1', 'friend', 'item', 'some', {})),
                catchError(err => of(err).pipe(
                    tap(() => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
                ))
            ))
        });
    });
});