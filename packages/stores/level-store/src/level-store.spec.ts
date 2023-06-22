import {first, firstValueFrom, from, last, map, mergeMap, range, switchMap, tap, toArray} from "rxjs";
import {getNode, graphOpen, asNodeId, asGraphId} from "@end-game/graph";
import type {GraphWithLevel} from './index.js'
import {levelStoreHandlers} from "./index.js";
import {addThingNode} from "@end-game/test-utils";
import {rm} from "fs/promises";
import {expect} from 'chai';


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
                mergeMap(n => getNode(graph, asNodeId(`thing${n}`), {}).pipe(first())),
                map(({nodeId}) => nodeId),
                toArray()
            )),
            tap(ids => expect(ids.sort()).to.deep.equal([
                "thing1",
                "thing10",
                "thing2",
                "thing3",
                "thing4",
                "thing5",
                "thing6",
                "thing7",
                "thing8",
                "thing9"
            ]))
        ))
    )
})