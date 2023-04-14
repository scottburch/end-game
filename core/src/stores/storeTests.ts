import {
    first,
    firstValueFrom,
    from,
    last,
    map,
    mergeMap,
    Observable,
    of,
    range,
    skipWhile,
    switchMap,
    tap,
    toArray
} from "rxjs";
import {expect} from 'chai'
import {GraphStore} from "../graph/graph.js";
import {getStoreKeys, storePut, storeRead} from "./storeFunctions.js";


export const runStoreTests = (storeFactory: () => Observable<GraphStore>) => {

    it('should store/retrieve a value', (done) => {
        storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => storePut(store, 'my-key', {d: 'my-data'})),
                switchMap(() => storeRead(store, 'my-key')),
                tap(value => expect(value).to.deep.equal({d: 'my-data'})),
                switchMap(() => store.db.close())
            ))
        ).subscribe(() => done());
    });

    it('should retrieve keys for a base', (done) => {
        storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => range(1, 3)),
                mergeMap(n => storePut(store, `a.b.${n}`, n)),
                toArray(),
                switchMap(() => storePut(store, 'a.b.4.x', 'foo')),
                switchMap(() => getStoreKeys(store, 'a.b')),
                tap(keys => expect(keys).to.deep.equal(['1', '2', '3'])),
                switchMap(() => store.db.close())
            ))
        ).subscribe(() => done());
    });

    it('should be able to search for a key range', () => {
        return firstValueFrom(storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => range(1, 10)),
                mergeMap(n => storePut(store, `a.b.${n}`, n)),
                first(),
                switchMap(() => getStoreKeys(store, 'a.b', {gt: '2', limit: 5})),
                tap(keys => expect(keys).to.deep.equal(['3', '4', '5', '6', '7'])),
                switchMap(() => store.db.close())
            ))
        ))
    });

    it('should re-search after the first', () => {
        return firstValueFrom(storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => range(1, 10)),
                mergeMap(n => storePut(store, `a.b.${n}`, n)),
                first(),
                switchMap(() => getStoreKeys(store, 'a.b', {gt: '2', limit: 5})),
                tap(keys => expect(keys).to.deep.equal(['3', '4', '5', '6', '7'])),
                switchMap(() => getStoreKeys(store, 'a.b', {gt: '4', limit: 2})),
                tap(keys => expect(keys).to.deep.equal(['5', '6'])),
                switchMap(() => store.db.close())
            ))
        ))
    });

    it('should be able to search for text', () =>
        firstValueFrom(storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => from(['alice','bob','alfi', 'charlie']).pipe(
                    mergeMap(n => storePut(store, `my.base.${n}`, 'x')),
                    last(),
                )),
                switchMap(() => getStoreKeys(store, 'my.base', {gt: 'b'})),
                skipWhile(keys => keys.length !== 2 || keys[0] !== 'bob' || keys[1] !== 'charlie'),
                switchMap(() => getStoreKeys(store, 'my.base', {gt: 'c'})),
                skipWhile(keys => keys.length !== 1 || keys[0] !== 'charlie'),
                tap(() => store.db.close())
            )),
        ))
    );

    it('should be able to search for a key range in reverse', () => {
        return firstValueFrom(storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => range(1, 10)),
                mergeMap(n => storePut(store, `a.b.${n}`, n)),
                last(),
                switchMap(() => getStoreKeys(store, 'a.b', {reverse: true, lt: '8', limit: 4})),
                tap(keys => expect(keys).to.deep.equal(['7', '6', '5', '4'])),
                switchMap(() => store.db.close())
            ))
        ));
    });

    it('should be able to search for child keys while skipping properties', () => {
        return firstValueFrom(storeFactory().pipe(
            switchMap(store => of(store).pipe(
                switchMap(() => range(1, 10)),
                mergeMap(n => storePut(store, `a.b.${n}`, n).pipe(map(() => n))),
                mergeMap(n => storePut(store, `a.b.${n}.child`, n)),
                last(),
                switchMap(() => getStoreKeys(store, 'a.b', {limit: 5, reverse: true, lt: '8'})),
                tap(result => expect(result).to.deep.equal(["7", "6", "5", "4", "3"])),
                switchMap(() => store.db.close())
            ))
        ))
    })
};