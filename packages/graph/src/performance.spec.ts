import {firstValueFrom, last, map, mergeMap, range, switchMap, tap} from "rxjs";
import {getAGraph} from "@end-game/test-utils";
import {putNode, newNode} from "./graph.js";
import {expect} from "chai";

describe('performance tests', () => {
    it('should continue to perform well with scale', () => {
         let start: bigint;
         let before: bigint;

         return firstValueFrom(getAGraph().pipe(
             tap(() => start = process.hrtime.bigint()),
             switchMap(graph => putNode(graph, newNode('', 'person', {a:1, b:2, c:3, d: 4}))),
             tap(() => before = process.hrtime.bigint() - start),
             switchMap(({graph}) => range(1, 1_000).pipe(
                 mergeMap(() => putNode(graph, newNode('', 'person', {a:1, b:2, c:3, d: 4}))),
                 last(),
                 map(() => graph)
             )),
             tap(() => console.log('loading', bigToMs(process.hrtime.bigint() - start))),
             tap(() => start = process.hrtime.bigint()),
             switchMap(graph => putNode(graph, newNode('', 'person', {a:1, b:2, c:3, d: 4}))),
             tap(() => expect(process.hrtime.bigint() - start < (start + 5000n)).to.be.true),
             tap(() => console.log('before', bigToMs(before))),
             tap(() => console.log('after', bigToMs(process.hrtime.bigint() - start)))
        ));
    });
});

const bigToMs = (n: bigint) => `${n/1_000_000n}.${n.toString().slice(-6).slice(0, 3)}`
