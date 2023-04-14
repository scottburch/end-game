import {from, map, of, switchMap, toArray} from "rxjs";
import {Post} from "./postService.js";

export const findNicknamesFromMentions = (post: Post) => of(post).pipe(
    map(post => post.text.match(/@[a-z0-9]*/g) || []),
    switchMap(from),
    map(mention => mention.slice(1)),
    toArray(),
    map(nicknames => ({post, nicknames}))
);

export const findTagsFromPost = (post: Post) => of(post).pipe(
    map(post => post.text.match(/#[a-z0-9\-]*/g) || []),
    switchMap(from),
    map(tag => tag.slice(1)),
    toArray(),
    map(tags => ({post, tags}))
);
