import {cacheDelete, cacheGet, cacheRemoveOld, cacheSet, newCache} from "./cache.js";
import {expect} from "chai";
import {delay, firstValueFrom, from, map, of, switchMap, tap, toArray} from "rxjs";

describe('cache', () => {
    it('should store a value', () =>
        firstValueFrom(of(newCache()).pipe(
            map(cache => cacheSet(cache, 'my-key', 10)),
            map(cache => cacheGet(cache, 'my-key')),
            tap(({value}) => expect(value).to.equal(10))
        ))
    );

    it('should delete a key', () =>
        firstValueFrom(of(newCache()).pipe(
            map(cache => cacheSet(cache, 'my-key', 10)),
            map(cache => cacheDelete(cache, 'my-key')),
            map(cache => cacheGet(cache, 'my-key')),
            tap(({value}) => expect(value).to.be.undefined)
        ))
    );

    it('should be able to remove old values after a given time', () =>
        firstValueFrom(of(newCache()).pipe(
            map(cache => cacheSet(cache, 'key1', 1)),
            delay(1000),
            map(cache => cacheSet(cache, 'key2', 2)),
            map(cache => cacheRemoveOld(cache, 500)),
            switchMap(cache => from([cacheGet(cache, 'key1'), cacheGet(cache, 'key2')])),
            map(({value}) => value),
            toArray(),
            tap(result => expect(result).to.deep.equal([undefined, 2]))
        ))
    );
});