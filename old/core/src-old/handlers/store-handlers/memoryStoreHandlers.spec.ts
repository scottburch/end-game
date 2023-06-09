import {AuthenticatedEndgame, endgameGet, endgameGetMeta, endgamePut} from "../../app/endgame";
import {testLocalAuthedEndgame, testLocalEndgame} from "../../test/testUtils";
import {
    combineLatest,
    filter,
    firstValueFrom,
    map,
    mergeMap,
    range,
    skip,
    switchMap,
    take,
    tap,
    toArray
} from "rxjs";
import {expect} from "chai";

describe('memory store handlers', () => {
    describe('get', () => {
        it('should return undefined if value does not exist', () =>
            firstValueFrom(testLocalEndgame().pipe(
                switchMap(endgame => endgameGet(endgame, 'my.path')),
                tap(({value}) => expect(value).to.be.undefined)
            ))
        );

        it('should get a value from the memory store', () =>
            firstValueFrom(testLocalAuthedEndgame().pipe(
                switchMap((endgame) => endgamePut(endgame as AuthenticatedEndgame, 'my.path', 10)),
                switchMap(({endgame}) => endgameGet(endgame, 'my.path')),
                tap(({value}) => expect(value).to.equal(10)),
                switchMap(({endgame}) => endgameGetMeta(endgame, 'my.path')),
                tap(({meta}) => {
                    expect(meta?.ownerPath).to.equal('my.user');
                    expect(meta?.sig).to.have.length(128);
                    expect(meta?.state).not.to.be.undefined
                })
            ))
        );

        it('should handle multiple values in parallel', () =>
            firstValueFrom(testLocalAuthedEndgame().pipe(
                switchMap((endgame) => range(1, 5).pipe(
                    mergeMap(n => endgamePut(endgame as AuthenticatedEndgame, `my.path${n}`, n)),
                )),
                skip(4),
                switchMap(({endgame}) => range(1, 5).pipe(
                    mergeMap(n => endgameGet(endgame, `my.path${n}`)),
                )),
                filter(({value}) => value !== undefined),
                take(5),
                map(({value}) => value),
                toArray(),
                tap(values => expect(values).to.deep.equal([1, 2, 3, 4, 5]))
            ))
        )

        it('should handle multiple endgame instances', () =>
            firstValueFrom(combineLatest([
                testLocalAuthedEndgame({username: 'username1', userPath: 'my.user1'}).pipe(
                    switchMap((endgame) => endgamePut(endgame as AuthenticatedEndgame, 'my.path1', 1)),
                    switchMap(({endgame}) => endgameGet<number>(endgame, 'my.path1')),
                ),
                testLocalAuthedEndgame({username: 'username2', userPath: 'my.user2'}).pipe(
                    switchMap(endgame => endgamePut(endgame as AuthenticatedEndgame, 'my.path2', 2)),
                    switchMap(({endgame}) => endgameGet<number>(endgame, 'my.path2')),
                )
            ]).pipe(
                tap(values => {
                    expect(values[0].value + values[1].value).to.equal(3)
                })
            ))
        )
    })
})