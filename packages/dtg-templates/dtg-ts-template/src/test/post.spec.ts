import {firstValueFrom, of, switchMap} from "rxjs";
import {openBrowser} from "@end-game/utils/openBrowser";
import {signupHelper} from "./utils/testUtils.js";

describe('post', () => {
    it('should add a post', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => signupHelper(page)),
            switchMap(page => of(page).pipe(
                switchMap(() => page.fill('#post-text', 'post1')),
                switchMap(() => page.click('button:text("Add post")')),
                switchMap(() => page.waitForSelector('a:text("Scooter")'))
            )),
        ))
    )
})