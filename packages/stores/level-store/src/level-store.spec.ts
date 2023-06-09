import {first, firstValueFrom, from, switchMap, tap} from "rxjs";
import {graphGetNode, graphOpen} from "@end-game/graph";
import type {GraphWithLevel} from './index.js';
import {levelStoreHandlers} from "./index.js";
import {addThingNode} from "@end-game/test-utils";
import {rm} from "fs/promises";

describe('level-store', () => {
    it.skip('should be able to persist the store', () =>
        firstValueFrom(from(rm('test-store', {force: true, recursive: true})).pipe(
            switchMap(() => graphOpen()),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph => addThingNode(graph, 1)),
            switchMap(({graph}) => (graph as GraphWithLevel).levelStore.close()),
            first(),
            switchMap(() => graphOpen()),
            switchMap(graph => levelStoreHandlers(graph, {dir: 'test-store'})),
            switchMap(graph=> graphGetNode(graph, 'thing1', {})),
            tap(x => x),
        ))
    )
})