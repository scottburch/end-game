import {catchError, delay, firstValueFrom, of, switchMap, tap, timer} from "rxjs";
import {graphWithAuth, graphWithUser} from "./test/testUtils.js";
import {doesAuthNodeExist, findAuthNode} from "./auth-utils.js";
import {expect} from "chai";
import {graphAuth, graphNewAuth} from "./user-auth.js";
import {graphPutNode, graphPutEdge} from "@end-game/graph";
import {newGraphNode} from "@end-game/graph";

describe('auth utils', () => {

    describe('doesAuthNodeExist()', () => {
        it('should return false after some time if node does not exist', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => doesAuthNodeExist(graph, 'me')),
                tap(({exists}) => expect(exists).to.be.false)
            ))
        );

        it('should return true if the auth node does exist', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => doesAuthNodeExist(graph, 'scott')),
                tap(({exists}) => expect(exists).to.be.true)
            ))
        );

        it('should work if the node is loaded remotely', () =>
            firstValueFrom(graphWithAuth().pipe(
                tap(graph => timer(1).pipe(
                    switchMap(() => graphNewAuth(graph, 'scott', 'pass'))
                ).subscribe()),
                // this delay is here to give the graphNewAuth time to complete since it will delay 1 sec also
                // which causes the dosAuthNodeExist() to fail
                delay(500),
                switchMap(graph => doesAuthNodeExist(graph, 'scott')),
                tap(({exists}) => expect(exists).to.be.true)
            ))
        )
    });

    describe('findAuthNode()', () => {
        it('should return a node with an undefined nodeId if not found', () => {
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => findAuthNode(graph, 'not-here')),
                tap(({node}) => expect(node.nodeId).to.be.undefined)
            ))
        });

        it('should return a auth node if one exists', () => {
            firstValueFrom(graphWithUser().pipe(
                switchMap(graph => findAuthNode(graph, 'scott')),
                tap(({node}) => expect(node.nodeId).to.have.length(12))
            ))
        });

        it('should work if the node is loaded remotely', () =>
            firstValueFrom(graphWithAuth().pipe(
                tap(graph => timer(1).pipe(
                    switchMap(() => graphNewAuth(graph, 'scott', 'pass'))
                ).subscribe()),
                // this delay is here to give the graphNewAuth time to complete since it will delay 1 sec also
                // which causes the dosAuthNodeExist() to fail
                delay(500),
                switchMap(graph => findAuthNode(graph, 'scott')),
                tap(({node}) => expect(node.nodeId).to.have.length(12))
            ))
        );
    });

    describe('isUserAuthedToWriteEdge()', () => {
        it('should not allow you to add a edge "from" a node you do not own', (done) => {
            firstValueFrom(graphWithUser().pipe(
                switchMap(graph => graphPutNode(graph, newGraphNode('item', 'person', {}))),
                switchMap(({graph}) => graphNewAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphPutEdge(graph, 'edge1', 'friend', 'item', 'some', {})),
                catchError(err => of(err.code).pipe(
                    tap(err => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
                ))
            ))
        });

        it('should not allow you to add a edge "from" a node you do not own (with delay)', (done) => {
            firstValueFrom(graphWithUser().pipe(
                tap(graph => timer(1).pipe(
                    switchMap(() => graphPutNode(graph, newGraphNode('item', 'person', {})))
                ).subscribe()),
                switchMap(graph => graphNewAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'todd', 'pass')),
                switchMap(({graph}) => graphPutEdge(graph, 'edge1', 'friend', 'item', 'some', {})),
                catchError(err => of(err.code).pipe(
                    tap(err => err === 'UNAUTHORIZED_USER' ? done() : done(`wrong error thrown: ${err}`))
                ))
            ))
        });
    });
});