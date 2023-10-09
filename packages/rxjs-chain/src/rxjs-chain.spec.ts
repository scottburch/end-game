import {
    addChainFilter,
    appendHandler,
    chainNext,
    insertHandlerAfter,
    insertHandlerBefore,
    newRxjsChain
} from "./rxjs-chain.js";
import {expect} from "chai";
import {
    bufferCount,
    catchError,
    filter,
    firstValueFrom,
    last,
    map, mergeMap,
    of,
    range,
    switchMap,
    take,
    tap,
    throwError,
    toArray
} from "rxjs";

describe('rxjs chain', () => {
    it('should create a new chain', () => {
        expect(newRxjsChain({name: 'testing'}).fns).to.have.length(0);
    });

    it('should append a handler', () =>
        firstValueFrom(of(newRxjsChain<string>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain,'fn1', (v: string) => of(v + '1'))),
            tap(chain => appendHandler(chain,'fn2', (v: string) => of(v + '2'))),
            tap(chain => {
                expect(chain.fns).to.have.length(2);
                expect(chain.fns[0][0]).to.equal('fn1');
                expect(chain.fns[1][0]).to.equal('fn2');
            }),
            tap(chain => setTimeout(() => chainNext(chain, 'a').subscribe())),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12'))
        ))
    );

    it('should insert a handler before', () =>
        firstValueFrom(of(newRxjsChain<string>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain,'fn1', (v: string) => of(v + '1'))),
            tap(chain => appendHandler(chain,'fn2', (v: string) => of(v + '2'))),
            tap(chain => appendHandler(chain, 'fn4', (v: string) => of(v + '4'))),
            tap(chain => appendHandler(chain, 'fn5', (v: string) => of(v + '5'))),
            tap(chain => insertHandlerBefore(chain,'fn4', 'fn3', (v: string) => of(v + '3'))),
            tap(chain => {
                expect(chain.fns).to.have.length(5);
            }),
            tap(chain => setTimeout(() => chainNext(chain, 'a').subscribe())),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12345'))
        ))
    );

    it('should insert a handler after', () =>
        firstValueFrom(of(newRxjsChain<string>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain,'fn1', (v: string) => of(v + '1'))),
            tap(chain => appendHandler(chain,'fn2', (v: string) => of(v + '2'))),
            tap(chain => appendHandler(chain,'fn4', (v: string) => of(v + '4'))),
            tap(chain => appendHandler(chain,'fn5', (v: string) => of(v + '5'))),
            tap(chain => insertHandlerAfter(chain,'fn2', 'fn3', (v: string) => of(v + '3'))),
            tap(chain => {
                expect(chain.fns).to.have.length(5);
            }),
            tap(chain => setTimeout(() => chainNext(chain, 'a').subscribe())),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12345'))
        ))
    );

    it('should not error out if there are no listeners', () =>
        firstValueFrom(of(newRxjsChain({name: 'testing'})).pipe(
            tap(chain => chainNext(chain, 'testing'))
        ))
    );

    it('should allow for multiple input events and chain listeners', () =>
        firstValueFrom(of(newRxjsChain({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain,'mine', (s) => of(s + 'xx'))),
            tap(chain => setTimeout(() => chainNext(chain, 'testing').subscribe())),
            tap(chain => setTimeout(() => chainNext(chain, 'testing2').subscribe(), 100)),
            tap(chain => setTimeout(() => chainNext(chain, 'testing3').subscribe(), 200)),
            switchMap(chain => chain),
            bufferCount(3),
            tap(x => expect(x).to.deep.equal([
                "testingxx",
                "testing2xx",
                "testing3xx"
            ]))
        ))
    );

    it('should wait until the chain completes to return the chainNext()', (done) => {
        let called = ''
        firstValueFrom(of(newRxjsChain<number>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain, 'mine', n => of(n + 1))),
            tap(chain => setTimeout(() => chainNext(chain, 1).pipe(
                tap(n => expect(n).to.equal(2)),
                tap(() => called === 'end' && done())
            ).subscribe())),
            switchMap(chain => chain),
            tap(n => expect(n).to.equal(2)),
            tap(() => called += 'end')
        ))
    });

    it('should allow a handler to emit multiple events', () =>
        firstValueFrom(of(newRxjsChain<string>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain,'mine1', (s: string) => of(s + '-a'))),
            tap(chain => appendHandler(chain,'mine2', (s) => range(1,3).pipe(
                map(n => `${s}-${n}`)
            ))),
            tap(chain => appendHandler(chain,'mine3', (s) => range(1,3).pipe(
                map(n => `${s}-${n}`)
            ))),
            tap(chain => setTimeout(() => chainNext(chain, 'testing').subscribe())),
            switchMap(chain => chain),
            bufferCount(9),
            tap(x => expect(x).to.deep.equal([
                "testing-a-1-1",
                "testing-a-1-2",
                "testing-a-1-3",
                "testing-a-2-1",
                "testing-a-2-2",
                "testing-a-2-3",
                "testing-a-3-1",
                "testing-a-3-2",
                "testing-a-3-3"
            ]))

        ))
    );

    it('should be able to only forward some messages', () =>
        firstValueFrom(of(newRxjsChain<number>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain, 'oddOnly',  n => of(n).pipe(
                filter(n => !!(n % 2))
            ))),
            switchMap(chain => range(1,5).pipe(
                tap(n => setTimeout(() => chainNext(chain, n).subscribe())),
                map(() => chain),
                last()
            )),
            switchMap(chain => chain),
            take(3),
            toArray(),
            tap(x => expect(x).to.deep.equal([1,3,5]))
        ))
    );

    it('should allow you to catch errors thrown in handlers', (done) => {
        firstValueFrom(of(newRxjsChain<string>({name: 'testing'})).pipe(
            tap(chain => appendHandler(chain, 'error', () => throwError(() => 'testError'))),
            switchMap(chain => chainNext(chain, 'testing')),
            catchError(err => err === 'testError' ? of(done()) : throwError('error should be "testError"'))
        ))
    });

    it('should notify the stream even without handlers', (done) => {
        firstValueFrom(of(newRxjsChain<number>({name: 'testing'})).pipe(
            tap(chain => chain.subscribe(v => v === 10 ? done() : done('event with wront value: ' + v))),
            switchMap(chain => chainNext(chain, 10))
        ))
    });

    it('should be able to filter a chain based on handler name', (done) => {
        const results: number[] = [];
        firstValueFrom(of(newRxjsChain<number>({name: 'testing'})).pipe(
            tap(chain => addChainFilter(chain, (chain, handlerName, val) =>
                of(handlerName !== 'donotpass')
            )),
            tap(chain => appendHandler(chain, 'donotpass', (v) =>
                throwError(() => `received value and should not have: ${v}`))
            ),
            tap(chain => appendHandler(chain, 'dopass', (v) => of(results.push(v)))),
            switchMap(chain => range(1,6).pipe(map(n => ({n, chain})))),
            mergeMap(({n, chain}) => chainNext(chain, n)),
            last(),
            tap(() => done(results.length === 6 ? undefined : 'does not pass all events')),
            catchError(err => of(done(err)))
        ))
    })
});