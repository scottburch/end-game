import {firstValueFrom, of, switchMap, tap} from "rxjs";
import {Post} from "./postService.js";
import {expect} from "chai";
import {findNicknamesFromMentions, findTagsFromPost} from "./postUtils.js";

describe('post service', () => {
     describe('findNicknamesFromMentions', () => {
         it('should find mentions in a post', () =>
             firstValueFrom(of({
                 owner: 'the-owner',
                 text: 'here is @some @mentions in the @text!',
                 timestamp: ''
             } satisfies Post).pipe(
                 switchMap(findNicknamesFromMentions),
                 tap(({post, nicknames}) => {
                     expect(post.owner).to.equal('the-owner');
                     expect(nicknames).to.deep.equal(['some', 'mentions', 'text'])
                 })
             ))
         );

         it('should work when there are no mentions', () =>
                firstValueFrom(of({
                    owner: 'the-owner',
                    text: 'there are no mentions',
                    timestamp: ''
                } satisfies Post).pipe(
                    switchMap(findNicknamesFromMentions),
                    tap(({post, nicknames}) => {
                        expect(post.owner).to.equal('the-owner');
                        expect(nicknames).to.have.length(0)
                    })
                ))
         );
     });

     describe('findTagsFromPost()', () => {
         it('should separate tags from a post', () =>
             firstValueFrom((of({
                 owner: 'the-owner',
                 text: 'here #are some #tags',
                 timestamp: ''
             } satisfies Post).pipe(
                 switchMap(findTagsFromPost),
                 tap(({post, tags}) => {
                     expect(post.owner).to.equal('the-owner');
                     expect(tags).to.deep.equal(['are', 'tags'])
                 })
             )))
         );

         it('should work with no tags', () =>
             firstValueFrom((of({
                 owner: 'the-owner',
                 text: 'here are no tags',
                 timestamp: ''
             } satisfies Post).pipe(
                 switchMap(findTagsFromPost),
                 tap(({post, tags}) => {
                     expect(post.owner).to.equal('the-owner');
                     expect(tags).to.have.length(0);
                 })
             )))
         );

         it('should separate tags from a post when post is first and not last', () =>
             firstValueFrom((of({
                 owner: 'the-owner',
                 text: '#here #are some tags',
                 timestamp: ''
             } satisfies Post).pipe(
                 switchMap(findTagsFromPost),
                 tap(({post, tags}) => {
                     expect(post.owner).to.equal('the-owner');
                     expect(tags).to.deep.equal(['here', 'are'])
                 })
             )))
         );
     });
});