import {first, firstValueFrom, from, last, map, mergeMap, range, switchMap, tap, toArray} from "rxjs";
import {getNode, graphOpen, asNodeId, asGraphId, putNode, newNode, nodesByProp} from "@end-game/graph";
import type {GraphWithLevel} from './index.js'
import {levelStoreHandlers} from "./index.js";
import {addThingNode} from "@end-game/test-utils";
import {rm} from "fs/promises";
import {expect} from 'chai';
import ld from 'lodash'


describe('level-store', () => {
    it('should be able to persist the store', () =>
        firstValueFrom(from(rm('test-store', {force: true, recursive: true})).pipe(
            switchMap(() => graphOpen({graphId: asGraphId('g1')})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => range(1, 10).pipe(
                mergeMap(n => addThingNode(graph, n)),
                last(),
            )),
            switchMap(({graph}) => (graph as GraphWithLevel).levelStore.close()),
            tap(x => x),
            switchMap(() => graphOpen({graphId: asGraphId('g1')})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => range(1, 10).pipe(
                mergeMap(n => getNode(graph, asNodeId(`thing${ld.padStart(n.toString(), 4, '0')}`), {}).pipe(first())),
                map(({nodeId}) => nodeId),
                toArray(),
                map(ids => ({ids, graph}))
            )),
            tap(({ids}) => expect(ids.sort()).to.deep.equal([
                "thing0001",
                "thing0002",
                "thing0003",
                "thing0004",
                "thing0005",
                "thing0006",
                "thing0007",
                "thing0008",
                "thing0009",
                "thing0010"
            ])),
            switchMap(({graph}) => graph.levelStore.close())
        ))
    );

    it('should create a property index', () =>
        firstValueFrom(from(rm('test-store', {force: true, recursive: true})).pipe(
            switchMap(() => graphOpen({graphId: asGraphId('g1')})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => putNode(graph, newNode(asNodeId('n1'), 'thing', {foo: 10}))),
            switchMap(({graph}) => nodesByProp(graph, 'thing', 'foo', 10)),
            tap(({nodes}) => expect(nodes[0].props.foo).to.equal(10)),
            switchMap(({graph}) => (graph as GraphWithLevel).levelStore.close())
        ))
    );

    it('should not create a property index on values over 32 bytes', () =>
        firstValueFrom(from(rm('test-store', {force: true, recursive: true})).pipe(
            switchMap(() => graphOpen({graphId: asGraphId('g1')})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => putNode(graph, newNode(asNodeId('n1'), 'thing', {foo: 10, bar: 'x'.repeat(33)}))),
            switchMap(({graph}) => nodesByProp(graph, 'thing', 'foo', 10)),
            tap(({nodes}) => expect(nodes[0].props.foo).to.equal(10)),
            switchMap(({graph}) => nodesByProp(graph, 'thing', 'bar', 'x'.repeat(33))),
            tap(({nodes}) => expect(nodes).to.have.length(0)),
            switchMap(({graph}) => (graph as GraphWithLevel).levelStore.close())
        ))
    );

    it('should not create an index for properties that are undefined', () =>
        firstValueFrom(from(rm('test-store', {force: true, recursive: true})).pipe(
            switchMap(() => graphOpen({graphId: asGraphId('g1')})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => putNode(graph, newNode(asNodeId('n1'), 'thing', {foo: 10, bar: undefined}))),
            switchMap(({graph}) => nodesByProp(graph, 'thing', 'foo', 10)),
            tap(({nodes}) => expect(nodes[0].props.foo).to.equal(10)),
            switchMap(({graph}) => nodesByProp(graph, 'thing', 'bar', undefined)),
            tap(({nodes}) => expect(nodes).to.have.length(0)),
            switchMap(({graph}) => (graph as GraphWithLevel).levelStore.close())
        ))
    );

});