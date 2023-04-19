import {
    AuthenticatedEndgame,
    endgameCreateUser,
    endgameGet,
    endgameLogin,
    endgameLogout,
    endgamePut,
    newEndgame,
    sendMsg
} from "./endgame.js";
import {
    bufferCount,
    catchError,
    concatMap,
    delay,
    firstValueFrom, last,
    map,
    mergeMap,
    of,
    range,
    switchMap, take,
    tap,
    timeout
} from "rxjs";
import {expect} from 'chai';
import {testLocalAuthedEndgame, testLocalEndgame} from "../test/testUtils.js";
import {handlers} from "../handlers/handlers.js";
import {EndgameGraphMeta} from "../graph/endgameGraph.js";


describe('endgame', () => {

    it('should be able to login after endgame is started', () =>
        firstValueFrom(testLocalEndgame().pipe(
            switchMap(endgame => endgameCreateUser(endgame, 'username', 'password', 'my.user')),
            switchMap(({endgame}) => endgameLogin(endgame, 'username', 'password', 'my.user')),
            tap(({endgame}) => expect((endgame as AuthenticatedEndgame).keys).not.to.be.undefined),
        ))
    );

    it('should be able to logout', () =>
        firstValueFrom(testLocalAuthedEndgame().pipe(
            switchMap((endgame) => endgameLogout(endgame as AuthenticatedEndgame)),
            tap(({endgame}) => {
                expect((endgame as AuthenticatedEndgame).keys).to.be.undefined;
                expect((endgame as AuthenticatedEndgame).username).to.be.undefined;
                expect((endgame as AuthenticatedEndgame).id).to.have.length(10);
            })
        ))
    );

    describe('sendMsg()', () => {
        it('should only send a peer-in-event if msg is marked local', (done) => {
            newEndgame({}).pipe(
                tap(endgame => firstValueFrom(sendMsg(endgame, 'mine', {}, {forward: false, local: true}))),
                switchMap(endgame => endgame.config.handlers.peersOut),
                tap(() => done('peers-out-event called when it should not be')),
                timeout(1000),
                catchError(err => err.name === 'TimeoutError' ? of(done()) : of(done(err.message)))
            ).subscribe();
        });
    });

    describe('endgameGet()', () => {
        it('should send a message down the endgame-get handlers', () =>
            firstValueFrom(newEndgame({
                handlers: {
                    get: handlers<'get'>([({endgame, path}) => of({endgame, path, value: 10})])
                }
            }).pipe(
                switchMap(endgame => endgameGet<number>(endgame, 'my-key')),
                tap(({value}) => expect(value).to.equal(10))
            ))
        )
    });

    describe('endgamePut()', () => {
        it('should write a value to a store', () =>
            firstValueFrom(testLocalAuthedEndgame().pipe(
                switchMap((endgame) => endgamePut(endgame, 'my.path', 'my-value')),
                switchMap(({endgame}) => endgameGet(endgame, 'my.path')),
                tap(({value}) => expect(value).to.equal('my-value'))
            ))
        );
    });

    it('should', () =>
        firstValueFrom(testLocalAuthedEndgame().pipe(
            tap(() => (global as any).start = Date.now()),
            switchMap(endgame => range(1, 100).pipe(
                mergeMap(n => endgamePut(endgame, 'my.path' + n, n)),
            )),
            take(100),
            last(),
            tap(() => console.log(Date.now() - (global as any).start)),
            switchMap(({endgame}) => range(1, 100).pipe(
                mergeMap(n => endgameGet(endgame, 'my.path' + n))
            )),
            bufferCount(100),
            tap(() => console.log(Date.now() - (global as any).start)),
        ))
    )
});

