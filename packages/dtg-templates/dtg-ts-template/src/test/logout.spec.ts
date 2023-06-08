import {firstValueFrom, of, switchMap} from "rxjs";
import {clickMenu, signupHelper} from "./utils/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('signin', () => {
    it('should sign out', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => of(undefined).pipe(
                switchMap(() => signupHelper(page)),
                switchMap(() => clickMenu(page)),
                switchMap(() => page.click(':text("Logout")')),
                switchMap(() => page.waitForSelector(':text("scott")', {state: 'detached'})),
            ))
        ))
    );
});