import {catchError, firstValueFrom, of, switchMap, tap} from "rxjs";
import type {GraphWithAuth} from './auth-utils.js'


import {expect} from 'chai'
import {graphWithAuth} from "./test/testUtils.js";
import {graphAuth, graphNewAuth, graphUnauth} from "./user-auth.js";
import {findAuthNode} from "./auth-utils.js";



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
                tap(() => err.code === 'USERNAME_ALREADY_EXISTS' ? done() : done('invalid error message'))
            ))
        ))
    })

    it('should return undefined user if auth failed', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
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
            tap(({graph}) => expect((graph as GraphWithAuth).user).to.be.undefined)
        ))
    });

    it("should notify on chain authChanged when user is changed", (done) => {
         firstValueFrom(graphWithAuth().pipe(
             switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
             tap(({graph}) => (graph as GraphWithAuth).chains.authChanged.pipe(
                 tap(({graph}) => (graph as GraphWithAuth).user?.username === 'scott' ? done() : done('authChanged fired without username'))
             ).subscribe()),
             switchMap(({graph}) => graphAuth(graph, 'scott', 'pass'))
         ))
    });

    it('should allow multiple users to be added', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
            switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
            switchMap(({graph}) => findAuthNode(graph, 'scott')),
            tap(({node}) => expect(node.nodeId).not.to.be.empty),
            switchMap(({graph}) => findAuthNode(graph, 'todd')),
            tap(({node}) => expect(node).not.to.be.empty)
        ))
    )
});