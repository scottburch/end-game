import {firstValueFrom, switchMap, tap} from "rxjs";

import {openBrowser} from "@end-game/utils/openBrowser";
import {expect} from "chai";
import {compileBrowserTestCode} from "@end-game/utils/testCodeCompiler";
import {absPath} from "@end-game/utils/absPath";

describe('react graph', () => {
    describe('context component', () => {
        it('should allow you to set the graph', () =>
            firstValueFrom(compileBrowserTestCode(absPath(import.meta.url, 'reactGraph-test.tsx')).pipe(
                switchMap(() => openBrowser()),
                switchMap(page => page.textContent('#graph-id')),
                tap(text => expect(text).to.equal('my-graph'))
            ))
        );
    });
});