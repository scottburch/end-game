import {firstValueFrom, of, switchMap} from "rxjs";
import {signupHelper} from "./utils/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('signin', () => {
    it('should sign out', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => of(undefined).pipe(
                switchMap(() => signupHelper(page)),
                switchMap(() => page.waitForSelector(':text("Welcome")')),
                switchMap(() => page.click(':text("Logout")'))
            ))
        ))
    )
});