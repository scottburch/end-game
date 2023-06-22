import {bufferCount, concatMap, delay, firstValueFrom, mergeMap, of, range, switchMap, tap, toArray} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {postHelper, signupHelper} from "./utils/testUtils.js";

describe('post', () => {
    it('should add a post', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => of(page).pipe(
                switchMap(() => signupHelper(page)),
                delay(1000),
                concatMap(() => range(1, 10).pipe(
                    concatMap(n => postHelper(page, `post-${n}`)),
                    concatMap(() => page.waitForSelector(':text("Scooter")')),
                )),
                concatMap(() => range(1, 10).pipe(
                    mergeMap(n => page.waitForSelector(`div:text("post-${n}")`))
                )),
                bufferCount(10)
            ))
        ))
    )
})