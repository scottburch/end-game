import {delay, firstValueFrom, of, switchMap} from "rxjs";
import {postHelper, signupHelper} from "./utils/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";

describe('tags', () => {
    it('should list posts by tag', () =>
        firstValueFrom(openBrowser({url: 'http://127.0.0.1:1234'}).pipe(
            switchMap(page => of(page).pipe(
                switchMap(() => signupHelper(page)),
                delay(1000),
                switchMap(() => postHelper(page, '1 a post with a #tag')),
                switchMap(() => postHelper(page, '2 a post with a #tag')),
                switchMap(() => postHelper(page, 'a post with no tag')),
                switchMap(() => page.click('a:text("#tag")')),
                delay(200),
                switchMap(() => page.locator('a:text("Scooter")').count().then(
                    count => expect(count).to.equal(2)
                )),
                switchMap(() => page.waitForSelector('span:text("1 a post with a")')),
                switchMap(() => page.waitForSelector('span:text("2 a post with a")')),
            ))
        ))
    );
})