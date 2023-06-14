import {combineLatest, delay, firstValueFrom, of, switchMap, tap} from "rxjs";
import {addThingNode, startTestNet} from "@end-game/test-utils";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {expect} from "chai";
import {getEdge, getNode, putEdge, newGraphEdge, asNodeId, asEdgeId} from "./graph.js";

describe('node state', () => {
    it('should update nodes according to state', () =>
        firstValueFrom(startTestNet([[2], [3], [3], []]).pipe(
            switchMap(({node0, node1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => addThingNode(node0, 1, {foo: 10})),
                delay(6000),
                switchMap(() => addThingNode(node0, 1, {foo: 11})),
                delay(1000),
                switchMap(() => combineLatest([
                    getNode(node0, asNodeId('thing1') , {}),
                    getNode(node1, asNodeId('thing1') , {})
                ])),
                tap(([{node:n0}, {node:n1}]) => {
                    expect(n0.props.foo).to.equal(11);
                    expect(n1.props.foo).to.equal(11);
                })
            ))
        ))
    );

    it('should update edges according to state', () =>
        firstValueFrom(startTestNet([[2], [3], [3], []]).pipe(
            switchMap(({node0, node1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => putEdge(node0, newGraphEdge(asEdgeId('e1'), 'rel', asNodeId('from') , asNodeId('to') , {foo: 10}))),
                delay(6000),
                switchMap(() => putEdge(node0, newGraphEdge(asEdgeId('e1'), 'rel', asNodeId('from') , asNodeId('to') , {foo: 11}))),
                delay(6000),
                switchMap(() => combineLatest([
                    getEdge(node0, asEdgeId('e1'), {}),
                    getEdge(node1, asEdgeId('e1'), {})
                ])),
                tap(([{edge:e0}, {edge:e1}]) => {
                    expect(e0.props.foo).to.equal(11);
                    expect(e1.props.foo).to.equal(11);
                })
            ))
        ))
    );
});