import {Post} from "../types/Post.js";
import {from, map, of, switchMap, toArray} from "rxjs";

export const findNicknamesFromMentions = (post: Post) => of(post).pipe(
    map(post => post.text.match(/@[a-z0-9]*/g) || []),
    switchMap(from),
    map(mention => mention.slice(1)),
    toArray(),
    map(nicknames => ({post, nicknames}))
);

export const findTagsFromPost = (text: string) => of(text).pipe(
    map(text => text.match(/#[a-z0-9\-]*/g) || []),
    switchMap(from),
    map(tag => tag.slice(1)),
    toArray(),
    map(tags => tags)
);
