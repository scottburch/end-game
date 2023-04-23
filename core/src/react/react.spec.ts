import {compileBrowserTestCode, newBrowser} from "../test/e2eTestUtils.ts";
import {delay, firstValueFrom, switchMap} from "rxjs";

describe('react', () => {
    it('should do it', () =>
        firstValueFrom(compileBrowserTestCode('react/react-test.tsx').pipe(
            switchMap(() => newBrowser())
        ))
    );
});