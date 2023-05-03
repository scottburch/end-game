import {newRxjsChain} from "./rxjs-chain.js";
import {expect} from "chai";
import {bufferCount, firstValueFrom, map, of, range, switchMap, tap} from "rxjs";

describe('rxjs chain', () => {
    it('should create a new chain', () => {
        expect(newRxjsChain().fns).to.have.length(0);
    });

    it('should append a handler', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => chain.appendHandler('fn1', (v: string) => of(v + '1'))),
            tap(chain => chain.appendHandler('fn2', (v: string) => of(v + '2'))),
            tap(chain => {
                expect(chain.fns).to.have.length(2);
                expect(chain.fns[0][0]).to.equal('fn1');
                expect(chain.fns[1][0]).to.equal('fn2');
            }),
            tap(chain => setTimeout(() => chain.next('a'))),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12'))
        ))
    );

    it('should insert a handler before', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => chain.appendHandler('fn1', (v: string) => of(v + '1'))),
            tap(chain => chain.appendHandler('fn2', (v: string) => of(v + '2'))),
            tap(chain => chain.appendHandler('fn4', (v: string) => of(v + '4'))),
            tap(chain => chain.appendHandler('fn5', (v: string) => of(v + '5'))),
            tap(chain => chain.insertHandlerBefore('fn4', 'fn3', (v: string) => of(v + '3'))),
            tap(chain => {
                expect(chain.fns).to.have.length(5);
            }),
            tap(chain => setTimeout(() => chain.next('a'))),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12345'))
        ))
    );

    it('should insert a handler after', () =>
        firstValueFrom(of(newRxjsChain<string>()).pipe(
            tap(chain => chain.appendHandler('fn1', (v: string) => of(v + '1'))),
            tap(chain => chain.appendHandler('fn2', (v: string) => of(v + '2'))),
            tap(chain => chain.appendHandler('fn4', (v: string) => of(v + '4'))),
            tap(chain => chain.appendHandler('fn5', (v: string) => of(v + '5'))),
            tap(chain => chain.insertHandlerAfter('fn2', 'fn3', (v: string) => of(v + '3'))),
            tap(chain => {
                expect(chain.fns).to.have.length(5);
            }),
            tap(chain => setTimeout(() => chain.next('a'))),
            switchMap(chain => chain),
            tap(v => expect(v).to.equal('a12345'))
        ))
    );

    it('should not error out if there are no listeners', () =>
        firstValueFrom(of(newRxjsChain()).pipe(
            tap(chain => chain.next('testing'))
        ))
    );

    it('should allow for multiple input events and chain listeners', () =>
        firstValueFrom(of(newRxjsChain()).pipe(
            tap(chain => chain.appendHandler('mine', (s) => of(s + 'xx'))),
            tap(chain => setTimeout(() => chain.next('testing'))),
            tap(chain => setTimeout(() => chain.next('testing2'), 100)),
            tap(chain => setTimeout(() => chain.next('testing3'), 200)),
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
            tap(chain => chain.appendHandler('mine1', (s: string) => of(s + '-a'))),
            tap(chain => chain.appendHandler('mine2', (s) => range(1,3).pipe(
                map(n => `${s}-${n}`)
            ))),
            tap(chain => chain.appendHandler('mine3', (s) => range(1,3).pipe(
                map(n => `${s}-${n}`)
            ))),
            tap(chain => setTimeout(() => chain.next('testing'))),
            switchMap(chain => chain),
            tap(console.log),
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
});