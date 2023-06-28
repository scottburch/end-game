import {concatMap, delay, firstValueFrom, last, mergeMap, of, range, switchMap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {postHelper, signupHelper} from "./utils/testUtils.js";

describe('post', () => {
    it('should add a post', () =>
        firstValueFrom(openBrowser({url: 'http://127.0.0.1:1234'}).pipe(
            switchMap(page => of(page).pipe(
                switchMap(() => signupHelper(page)),
                delay(1000),
                concatMap(() => range(1, 5).pipe(
                    concatMap(n => postHelper(page, `post-${n}`)),
                    concatMap(() => page.waitForSelector(':text("Scooter")')),
                    last()
                )),
                concatMap(() => range(1, 5).pipe(
                    mergeMap(n => page.waitForSelector(`span:text("post-${n}")`)),
                    last()
                ))
            ))
        ))
    );
});