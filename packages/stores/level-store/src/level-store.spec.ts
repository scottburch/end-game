import {first, firstValueFrom, from, switchMap, tap} from "rxjs";
import {getNode, graphOpen, nodeId} from "@end-game/graph";
import type {GraphWithLevel} from './index.js';
import {levelStoreHandlers} from "./index.js";
import {addThingNode} from "@end-game/test-utils";
import {rm} from "fs/promises";
import {expect} from 'chai';

describe('level-store', () => {
    it('should be able to persist the store', () =>
        firstValueFrom(from(rm('test-store', {force: true, recursive: true})).pipe(
            switchMap(() => graphOpen({graphId: 'g1'})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => addThingNode(graph, 1)),
            switchMap(({graph}) => getNode(graph, nodeId('thing1') , {})),
            switchMap(({graph}) => (graph as GraphWithLevel).levelStore.close()),
            first(),
            switchMap(() => graphOpen({graphId: 'g1'})),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph=> getNode(graph, nodeId('thing1') , {})),
            tap(({node}) => {
                expect(node.nodeId).to.equal('thing1')
            }),
        ))
    )
})