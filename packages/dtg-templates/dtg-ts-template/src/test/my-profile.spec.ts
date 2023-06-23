import {firstValueFrom, of, switchMap} from "rxjs";
import {clickUserMenu, postHelper, signupHelper} from "./utils/testUtils.js";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('profile', () => {
    it('should update the users profile', () =>
        firstValueFrom(openBrowser().pipe(
            switchMap(page => of(page).pipe(
                switchMap(() => signupHelper(page)),
                switchMap(() => postHelper(page)),
                switchMap(() => clickUserMenu(page)),
                switchMap(() => page.click(':text("My Profile")')),
                switchMap(() => page.fill('#my-profile_display', 'Another')),
                switchMap(() => page.fill('#my-profile_aboutMe', 'Changed about me')),
                switchMap(() => page.click('button>:text("Update Profile")')),
                switchMap(() => page.click('a:text("Another")')),
                switchMap(() => page.waitForSelector('div:text("Changed about me")'))
            ))
        ))
    );
})