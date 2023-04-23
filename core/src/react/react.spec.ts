import {compileBrowserCode, newBrowser} from "../test/e2eTestUtils.js";
import {firstValueFrom, switchMap} from "rxjs";

describe('react', () => {
    it('should do it', () =>
        firstValueFrom(compileBrowserCode('src/index.html').pipe(
            switchMap(() => newBrowser()),
        ))
    );
});