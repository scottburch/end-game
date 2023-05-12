import {appendHandler, chainNext, insertHandlerAfter, insertHandlerBefore, newRxjsChain} from "./rxjs-chain.js";
import {expect} from "chai";
import {bufferCount, filter, firstValueFrom, last, map, of, range, switchMap, take, tap, toArray} from "rxjs";

describe('rxjs chain', () => {
    it('should create a new chain', () => {
        expect(newRxjsChain().fns).to.have.length(0);
    });

    it('should append a handler', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => appendHandler(chain,'fn1', (v: string) => of(v + '1'))),
            tap(chain => appendHandler(chain,'fn2', (v: string) => of(v + '2'))),
            tap(chain => {
                expect(chain.fns).to.have.length(2);
                expect(chain.fns[0][0]).to.equal('fn1');
                expect(chain.fns[1][0]).to.equal('fn2');
            }),
            tap(chain => setTimeout(() => chainNext(chain, 'a'))),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12'))
        ))
    );

    it('should insert a handler before', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => appendHandler(chain,'fn1', (v: string) => of(v + '1'))),
            tap(chain => appendHandler(chain,'fn2', (v: string) => of(v + '2'))),
            tap(chain => appendHandler(chain, 'fn4', (v: string) => of(v + '4'))),
            tap(chain => appendHandler(chain, 'fn5', (v: string) => of(v + '5'))),
            tap(chain => insertHandlerBefore(chain,'fn4', 'fn3', (v: string) => of(v + '3'))),
            tap(chain => {
                expect(chain.fns).to.have.length(5);
            }),
            tap(chain => setTimeout(() => chainNext(chain, 'a'))),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12345'))
        ))
    );

    it('should insert a handler after', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => appendHandler(chain,'fn1', (v: string) => of(v + '1'))),
            tap(chain => appendHandler(chain,'fn2', (v: string) => of(v + '2'))),
            tap(chain => appendHandler(chain,'fn4', (v: string) => of(v + '4'))),
            tap(chain => appendHandler(chain,'fn5', (v: string) => of(v + '5'))),
            tap(chain => insertHandlerAfter(chain,'fn2', 'fn3', (v: string) => of(v + '3'))),
            tap(chain => {
                expect(chain.fns).to.have.length(5);
            }),
            tap(chain => setTimeout(() => chainNext(chain, 'a'))),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12345'))
        ))
    );

    it('should not error out if there are no listeners', () =>
        firstValueFrom(of(newRxjsChain()).pipe(
            tap(chain => chainNext(chain, 'testing'))
        ))
    );

    it('should allow for multiple input events and chain listeners', () =>
        firstValueFrom(of(newRxjsChain()).pipe(
            tap(chain => appendHandler(chain,'mine', (s) => of(s + 'xx'))),
            tap(chain => setTimeout(() => chainNext(chain, 'testing'))),
            tap(chain => setTimeout(() => chainNext(chain, 'testing2'), 100)),
            tap(chain => setTimeout(() => chainNext(chain, 'testing3'), 200)),
            switchMap(chain => chain),
            bufferCount(3),
            tap(x => expect(x).to.deep.equal([
                "testingxx",
                "testing2xx",
                "testing3xx"
            ]))
        ))
    );

    it('should allow a handler to emit multiple events', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => appendHandler(chain,'mine1', (s: string) => of(s + '-a'))),
            tap(chain => appendHandler(chain,'mine2', (s) => range(1,3).pipe(
                map(n => `${s}-${n}`)
            ))),
            tap(chain => appendHandler(chain,'mine3', (s) => range(1,3).pipe(
                map(n => `${s}-${n}`)
            ))),
            tap(chain => setTimeout(() => chainNext(chain, 'testing'))),
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
        firstValueFrom(of(newRxjsChain<number>()).pipe(
            tap(chain => appendHandler(chain, 'oddOnly',  n => of(n).pipe(
                filter(n => !!(n % 2))
            ))),
            switchMap(chain => range(1,5).pipe(
                tap(n => setTimeout(() => chainNext(chain, n))),
                map(() => chain),
                last()
            )),
            switchMap(chain => chain),
            take(3),
            toArray(),
            tap(x => expect(x).to.deep.equal([1,3,5]))
        ))
    );
});