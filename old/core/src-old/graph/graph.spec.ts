import {
    graphKeys,
    graphPut,
    graphReadValue,
} from "./graph";
import {firstValueFrom, map, mergeMap, of, range, switchMap, tap, toArray} from "rxjs";
import {expect} from 'chai';
import {newMemoryStore} from "../stores/memoryStore";


describe('graph', () => {

    describe('storing in a graph', function () {
        this.timeout(10_000);

        it('should put a string in the db at a path', () =>
            firstValueFrom(of(newMemoryStore()).pipe(
                switchMap(store => graphPut(store, 'test-graph.a.b.c', 'my-data', 'my-meta')),
                switchMap(({store}) => graphReadValue(store, 'test-graph.a.b.c')),
                tap(({value}) => expect(value).to.equal('my-data'))
            ))
        );

        it('should take search options for keys', () =>
            firstValueFrom(of(newMemoryStore()).pipe(
                switchMap(store => range(1, 10).pipe(
                    mergeMap(n => graphPut(store, `test-graph.a.b.${n}`, n, 'my-meta')),
                    toArray(),
                    map(() => store)
                )),
                switchMap(store => graphKeys(store, 'test-graph.a.b', {gt: '2', limit: 4})),
                tap(({keys}) => expect(keys).to.deep.equal(["3","4","5","6"]))
            ))
        )
    });
});

