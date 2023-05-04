import {concatMap, delay, firstValueFrom, last, map, range, switchMap, tap} from "rxjs";
import {getAGraph} from "../test/testUtils.js";
import {graphPut} from "./graph.js";
import {expect} from "chai";

describe('performance tests', () => {
    it('should continue to perform well with scale', () => {
         let start: number;
         let before: number;

         return firstValueFrom(getAGraph().pipe(
             tap(() => start = Date.now()),
             switchMap(graph => graphPut(graph, '', 'person', {a:1, b:2, c:3, d: 4})),
             tap(() => before = Date.now() - start),
             switchMap(({graph}) => range(1, 1000).pipe(
                 delay(1),
                 concatMap(() => graphPut(graph, '', 'person', {a:1, b:2, c:3, d: 4})),
                 last(),
                 map(() => graph)
             )),
             tap(() => console.log('loading', Date.now() - start)),
             tap(() => start = Date.now()),
             switchMap(graph => graphPut(graph, '', 'person', {a:1, b:2, c:3, d: 4})),
             tap(() => expect(Date.now() - start).to.be.lessThan(start + 5)),
             tap(() => console.log('before', before)),
             tap(() => console.log('after', Date.now() - start))
        ));
    });
});