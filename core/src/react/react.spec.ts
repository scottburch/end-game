import {compileBrowserCode} from "../test/e2eTestUtils.js";
import {delay, firstValueFrom, tap} from "rxjs";

describe('react', () => {
    it('should do it', () =>
        firstValueFrom(compileBrowserCode('src/index.html').pipe(
            delay(10000000),
            tap(x => x)
        ))
    );
});