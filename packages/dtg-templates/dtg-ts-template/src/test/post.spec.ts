import {concatMap, delay, firstValueFrom, last, mergeMap, of, range, switchMap, tap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {postHelper, signupHelper} from "./utils/testUtils.js";
import {expect} from "chai";

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

    it("should be able to page posts", () =>
        firstValueFrom(openBrowser({url: 'http://127.0.0.1:1234'}).pipe(
            switchMap(page => of(page).pipe(
                switchMap(() => signupHelper(page)),
                delay(1000),
                concatMap(() => range(1, 15).pipe(
                    concatMap(n => postHelper(page, `post-${n}`)),
                    concatMap(() => page.waitForSelector(':text("Scooter")')),
                    last()
                )),
                switchMap(() => page.getByText('post-10').count()),
                tap(count => expect(count).to.equal(0)),
                switchMap(() => page.click(':text("Load More")')),
                switchMap(() => page.waitForSelector(':text("post-10")'))
            ))
        ))
    )
});