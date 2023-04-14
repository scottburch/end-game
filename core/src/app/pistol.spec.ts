import {AuthenticatedPistol, pistolAuth, pistolGet, pistolPut, pistolUnAuth, sendMsg} from "./pistol.js";
import {catchError, firstValueFrom, map, of, switchMap, tap, timeout} from "rxjs";
import {expect} from 'chai';
import {getTestKeys, newTestPistol, testAuthHandler, testChains, testDummyHandler} from "../test/testUtils.js";
import {generateNewAccount} from "../crypto/crypto.js";
import {PistolGraphMeta} from "../graph/pistolGraph.js";


describe('pistol', () => {

    it('should be able to login after pistol is started', () =>
        firstValueFrom(newTestPistol({chains: testChains({auth: testAuthHandler()})}).pipe(
            switchMap(pistol => pistolAuth(pistol, 'username', 'password', 'my.user')),
            tap(({pistol}) => expect(pistol.keys).not.to.be.undefined),
        ))
    );

    it('should be able to logout', () =>
        firstValueFrom(newTestPistol().pipe(
            switchMap(pistol => getTestKeys().pipe(map(keys => ({pistol, keys})))),
            switchMap(({pistol, keys}) => pistolAuth(pistol, 'username', 'password', 'my.user')),
            switchMap(({pistol}) => pistolUnAuth(pistol)),
            tap(({pistol}) => {
                expect((pistol as AuthenticatedPistol).keys).to.be.undefined;
                expect((pistol as AuthenticatedPistol).username).to.be.undefined;
                expect((pistol as AuthenticatedPistol).id).to.have.length(10);
            })
        ))
    );

    describe('sendMsg()', () => {
        it('should only send a peer-in-event if msg is marked local', (done) => {
            newTestPistol().pipe(
                tap(pistol => firstValueFrom(sendMsg(pistol, 'mine', {}, {forward: false, local: true}))),
                switchMap(pistol => pistol.config.chains.peersOut),
                tap(() => done('peers-out-event called when it should not be')),
                timeout(1000),
                catchError(err => err.name === 'TimeoutError' ? of(done()) : of(done(err.message)))
            ).subscribe();
        });
    });


    describe('pistolPut()', () => {
        it('should send a message down the pistol-put chain', () =>
            firstValueFrom(newTestPistol({chains: testChains({
                    auth: testAuthHandler(),
                    put: testDummyHandler<'put'>(({pistol, path, value}) => ({pistol, path, value: value + 1, meta: {} as PistolGraphMeta}))
            })}).pipe(
                switchMap(pistol => generateNewAccount().pipe(map(keys => ({keys, pistol})))),
                switchMap(({pistol, keys}) => pistolAuth(pistol, 'my-username', 'password', 'my.user')),
                switchMap(({pistol}) =>
                    pistolPut<number>(pistol, 'my-key', 10)
                ),
                tap(({value}) => expect(value).to.equal(11))
            ))
        )
    });

    describe('pistolGet()', () => {
        it('should send a message down the pistol-get chain', () =>
            firstValueFrom(newTestPistol({chains: testChains({
                    get: testDummyHandler<'get'>(({pistol, path}) => ({pistol, path, value: 10}))
                })}).pipe(
                switchMap(pistol => pistolGet<number>(pistol, 'my-key')),
                tap(({value}) => expect(value).to.equal(10))
            ))
        )
    })
});

