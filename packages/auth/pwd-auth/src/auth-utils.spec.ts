import {catchError, delay, firstValueFrom, of, switchMap, tap, timer} from "rxjs";
import {graphWithAuth, graphWithUser} from "./test/testUtils.js";
import {findAuthNode, graphGetOwnerNode} from "./auth-utils.js";
import {expect} from "chai";
import {graphAuth, graphNewAuth} from "./user-auth.js";
import {putEdge, putNode, newGraphEdge, newNode, asNodeId, asEdgeId} from "@end-game/graph";


describe('auth utils', () => {

    describe('findAuthNode()', () => {
        it('should return a node with an undefined nodeId if not found', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => findAuthNode(graph, 'not-here')),
                tap(({node}) => expect(node.nodeId).to.be.undefined)
            ))
        );

        it('should return a auth node if one exists', () =>
            firstValueFrom(graphWithUser().pipe(
                switchMap(graph => findAuthNode(graph, 'scott')),
                tap(({node}) => expect(node.nodeId).to.have.length(12))
            ))
        );

        it('should work if the node is loaded remotely', () =>
            firstValueFrom(graphWithAuth().pipe(
                tap(graph => timer(1).pipe(
                    switchMap(() => graphNewAuth(graph, 'scott', 'pass'))
                ).subscribe()),
                // this delay is here to give the graphNewAuth time to complete since it will delay 1 sec also
                // which causes the findAuthNode() to fail
                delay(700),
                switchMap(graph => findAuthNode(graph, 'scott')),
                tap(({node}) => expect(node.nodeId).to.have.length(12))
            ))
        );
    });

    describe('isUserAuthedToWriteEdge()', () => {
        it('should not allow you to add a edge "from" a node you do not own', (done) => {
            firstValueFrom(graphWithUser().pipe(
                switchMap(graph => putNode(graph, newNode(asNodeId('item'), 'person', {}))),
                switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => putEdge(graph, newGraphEdge(asEdgeId('edge1'), 'friend', asNodeId('item'), asNodeId('some'), {}))),
                catchError(err => of(err.code).pipe(
                    tap(err => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
                ))
            ))
        });

        it('should not allow you to add a edge "from" a node you do not own (with delay)', (done) => {
            firstValueFrom(graphWithUser().pipe(
                tap(graph => timer(1).pipe(
                    switchMap(() => putNode(graph, newNode(asNodeId('item'), 'person', {})))
                ).subscribe()),
                switchMap(graph => graphNewAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => putEdge(graph, newGraphEdge(asEdgeId('edge1'), 'friend', asNodeId('item'), asNodeId('some'), {}))),
                catchError(err => of(err.code).pipe(
                    tap(err => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
                ))
            ))
        });
    });

    describe('getNodeOwner()', () => {
        it('it should return the auth owner node for a given node', () =>
            firstValueFrom(graphWithUser().pipe(
                switchMap(graph => putNode(graph, newNode(asNodeId('item'), 'person', {}))),
                switchMap(({graph, nodeId}) => graphGetOwnerNode(graph, nodeId)),
                tap(({node}) => {
                    expect(node.nodeId).to.have.length(12);
                    expect(node.props.pub).to.not.be.empty;
                })
            ))
        );

        it('should be able to tolerate a delay', () =>
            firstValueFrom(graphWithUser().pipe(
                tap(graph => timer(1).pipe(
                    switchMap(() => putNode(graph, newNode(asNodeId('item'), 'person', {}))),
                ).subscribe()),
                delay(100),
                switchMap(graph => graphGetOwnerNode(graph, asNodeId('item'))),
                tap(({node}) => {
                    expect(node.nodeId).to.have.length(12);
                    expect(node.props.pub).to.not.be.empty;
                })
            ))
        );
    })
});