import {startTestNetwork} from "../test/testUtils.js";
import {combineLatest, delay, firstValueFrom, skipWhile, switchMap, timer} from "rxjs";
//import {pistolKeys} from "../graph/pistolGraph.js";
import {endgamePut} from "../app/endgame.js";

describe.skip('flood router', () => {
    // it('should bounce updates off a node in the middle', () =>
    //     firstValueFrom(startTestNetwork([[1], [2], []]).pipe(
    //         switchMap(pistols => combineLatest([
    //                 pistolKeys(pistols[2],  'some.key').pipe(
    //                     skipWhile(x => x.keys.join('') !== 'ab')
    //                 ),
    //                 timer(50).pipe(
    //                     switchMap(() => pistolPut(pistols[0], 'some.key.a', 'aa')),
    //                     delay(50),
    //                     switchMap(() => pistolPut(pistols[0], 'some.key.b', 'bb'))
    //                 )
    //             ])
    //         )
    //     ))
    // );
});
