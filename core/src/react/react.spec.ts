import {compileBrowserCode, newBrowser} from "../test/e2eTestUtils.ts";
import {delay, firstValueFrom, switchMap} from "rxjs";

describe('react', () => {
    it('should do it', () =>
        firstValueFrom(compileBrowserCode('src/react/react-graph.html').pipe(
            switchMap(() => newBrowser()),
            delay(100000000)
        ))
    );
});