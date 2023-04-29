import type { Page } from 'playwright';
import { Observable } from "rxjs";
export declare const newBrowser: () => Observable<Page>;
export declare const compileBrowserTestCode: (src: string) => Observable<unknown>;
//# sourceMappingURL=e2eTestUtils.d.ts.map