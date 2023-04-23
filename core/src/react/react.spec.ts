import {compileBrowserCode, newBrowser} from "../test/e2eTestUtils.ts";
import {delay, firstValueFrom, switchMap} from "rxjs";

describe('react', () => {
    it('should do it', () =>
        firstValueFrom(compileBrowserCode('react/react-graph.tsx').pipe(
            switchMap(() => newBrowser()),
        ))
    );
});