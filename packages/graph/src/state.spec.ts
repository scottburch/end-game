import {combineLatest, delay, firstValueFrom, of, switchMap, tap} from "rxjs";
import {addThingNode, startTestNet} from "@end-game/test-utils";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {expect} from "chai";
import {getEdge, getNode, putEdge, newGraphEdge, asNodeId, asEdgeId} from "./graph.js";

describe('node state', () => {
    it('should update nodes according to state', () =>
        firstValueFrom(startTestNet([[2], [3], [3], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => addThingNode(host0.graphs[0], 1, {foo: 10})),
                delay(6000),
                switchMap(() => addThingNode(host0.graphs[0], 1, {foo: 11})),
                delay(1000),
                switchMap(() => combineLatest([
                    getNode(host0.graphs[0], asNodeId('thing1') , {}),
                    getNode(host1.graphs[0], asNodeId('thing1') , {})
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
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => putEdge(host0.graphs[0], newGraphEdge(asEdgeId('e1'), 'rel', asNodeId('from') , asNodeId('to') , {foo: 10}))),
                delay(6000),
                switchMap(() => putEdge(host0.graphs[0], newGraphEdge(asEdgeId('e1'), 'rel', asNodeId('from') , asNodeId('to') , {foo: 11}))),
                delay(6000),
                switchMap(() => combineLatest([
                    getEdge(host0.graphs[0], asEdgeId('e1'), {}),
                    getEdge(host1.graphs[0], asEdgeId('e1'), {})
                ])),
                tap(([{edge:e0}, {edge:e1}]) => {
                    expect(e0.props.foo).to.equal(11);
                    expect(e1.props.foo).to.equal(11);
                })
            ))
        ))
    );
});