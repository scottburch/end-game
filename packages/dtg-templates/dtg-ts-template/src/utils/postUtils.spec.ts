import {firstValueFrom, of, switchMap, tap} from "rxjs";
import {findTagsFromPost} from "./postUtils.js";
import {expect} from 'chai'

describe('post utils', () => {
    describe('findTagsFromPost()', () => {
        it('should handle a post with no tags', () =>
            firstValueFrom(of('this is a post with no tags').pipe(
                switchMap(findTagsFromPost),
                tap(tags => expect(tags).to.have.length(0))
            ))
        );

        it('should handle a post with a single tag', () =>
            firstValueFrom(of('this is a post with #one tag').pipe(
                switchMap(findTagsFromPost),
                tap(tags => expect(tags).to.deep.equal(['one']))
            ))
        );

        it("should handle a post with multiple tags", () =>
            firstValueFrom(of('this is a post with #one #two #three tags').pipe(
                switchMap(findTagsFromPost),
                tap(tags => expect(tags).to.deep.equal(['one', 'two', 'three']))
            ))
        )
    });
});