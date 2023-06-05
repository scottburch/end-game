import {firstValueFrom, switchMap} from "rxjs";
import {signupHelper} from "./utils/signupHelper.js";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('signin', () => {
    it('should sign in', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => signupHelper(page)),
            switchMap(page => page.waitForSelector(':text("Add a post")'))
        ))
    )
});