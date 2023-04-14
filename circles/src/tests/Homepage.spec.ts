/**
 * @jest-environment node
 */
import {openCircles, shotIt} from "./testUtils";
import {firstValueFrom, switchMap, tap} from 'rxjs';
import {Page} from 'playwright'


describe('Homepage', () => {
    it('should display a homepage', () =>
        firstValueFrom(openCircles().pipe(
            switchMap((page: Page) => shotIt(page, 'homepage')),
            tap(x => x)
        ))
    )
});