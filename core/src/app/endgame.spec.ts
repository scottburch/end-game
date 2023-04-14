import {AuthenticatedEndgame, endgameAuth, endgameGet, endgamePut, endgameUnAuth, sendMsg} from "./endgame.js";
import {catchError, firstValueFrom, map, of, switchMap, tap, timeout} from "rxjs";
import {expect} from 'chai';
import {getTestKeys, newTestEndgame, testAuthHandler, testChains, testDummyHandler} from "../test/testUtils.js";
import {generateNewAccount} from "../crypto/crypto.js";
import {EndgameGraphMeta} from "../graph/endgameGraph.js";


describe('endgame', () => {

    it('should be able to login after endgame is started', () =>
        firstValueFrom(newTestEndgame({chains: testChains({auth: testAuthHandler()})}).pipe(
            switchMap(endgame => endgameAuth(endgame, 'username', 'password', 'my.user')),
            tap(({endgame}) => expect(endgame.keys).not.to.be.undefined),
        ))
    );

    it('should be able to logout', () =>
        firstValueFrom(newTestEndgame().pipe(
            switchMap(endgame => getTestKeys().pipe(map(keys => ({endgame, keys})))),
            switchMap(({endgame, keys}) => endgameAuth(endgame, 'username', 'password', 'my.user')),
            switchMap(({endgame}) => endgameUnAuth(endgame)),
            tap(({endgame}) => {
                expect((endgame as AuthenticatedEndgame).keys).to.be.undefined;
                expect((endgame as AuthenticatedEndgame).username).to.be.undefined;
                expect((endgame as AuthenticatedEndgame).id).to.have.length(10);
            })
        ))
    );

    describe('sendMsg()', () => {
        it('should only send a peer-in-event if msg is marked local', (done) => {
            newTestEndgame().pipe(
                tap(endgame => firstValueFrom(sendMsg(endgame, 'mine', {}, {forward: false, local: true}))),
                switchMap(endgame => endgame.config.chains.peersOut),
                tap(() => done('peers-out-event called when it should not be')),
                timeout(1000),
                catchError(err => err.name === 'TimeoutError' ? of(done()) : of(done(err.message)))
            ).subscribe();
        });
    });


    describe('endgamePut()', () => {
        it('should send a message down the endgame-put chain', () =>
            firstValueFrom(newTestEndgame({chains: testChains({
                    auth: testAuthHandler(),
                    put: testDummyHandler<'put'>(({endgame, path, value}) => ({endgame, path, value: value + 1, meta: {} as EndgameGraphMeta}))
            })}).pipe(
                switchMap(endgame => generateNewAccount().pipe(map(keys => ({keys, endgame})))),
                switchMap(({endgame, keys}) => endgameAuth(endgame, 'my-username', 'password', 'my.user')),
                switchMap(({endgame}) =>
                    endgamePut<number>(endgame, 'my-key', 10)
                ),
                tap(({value}) => expect(value).to.equal(11))
            ))
        )
    });

    describe('endgameGet()', () => {
        it('should send a message down the endgame-get chain', () =>
            firstValueFrom(newTestEndgame({chains: testChains({
                    get: testDummyHandler<'get'>(({endgame, path}) => ({endgame, path, value: 10}))
                })}).pipe(
                switchMap(endgame => endgameGet<number>(endgame, 'my-key')),
                tap(({value}) => expect(value).to.equal(10))
            ))
        )
    })
});

