import {
    combineLatest,
    first,
    from,
    last,
    map,
    mergeMap,
    of,
    skipWhile,
    switchMap,
    throwError,
    timeout
} from "rxjs";
import {
    AuthenticatedPistol,
    getPistol,
    pistolKeys,
    pistolRead,
    putPistolValue,
    usePistolValue
} from "@scottburch/pistol";
import {findNicknamesFromMentions, findTagsFromPost} from "./postUtils.js";
import {getOwnerFromNickname, userKey} from "./userService.js";
import {pistolWriteObj, reachIdxKey, reachKey} from "./reachService.js";

export type Post = {
    owner: string,
    timestamp: string,
    text: string
}

export const reachPostsBase = () => reachKey('posts');

export const reachPostsKey = (key: string) => `${reachPostsBase()}.${key}`

export const postKey = (timestamp: string, key: string) =>
    reachPostsKey(`${timestamp}.${key}`);

export const tagsBase = () => reachKey('tags');

export const tagPostIdxBase = (tag: string) => `${tagsBase()}.${tag}.posts`;

export const tagPostIdxKey = (tag: string, timestamp: string)  => `${tagPostIdxBase(tag)}.${timestamp}`;

export const getIsoTime = () => new Date().toISOString();

export const writePost = (post: Omit<Post, 'timestamp' | 'owner'>) =>
    of(post).pipe(
        map(post => ({
            ...post,
            timestamp: getIsoTime(),
            owner: (getPistol() as AuthenticatedPistol).pubKeyHex
        } satisfies Post)),
        switchMap(ensureNicknamesExist),
        switchMap(post => pistolWriteObj<Post>(reachPostsKey(keyFromIso(post.timestamp)), post).pipe(
            map(() => post)
        )),
        // write an empty posts.[timestamp] entry so that pistolKeys works on posts
        switchMap(post => putPistolValue(reachPostsKey(keyFromIso(post.timestamp)), 'x').pipe(
            map(() => post)
        )),
        switchMap(writePostOwnerIdx),
        switchMap(generateMentionsFromPost),
        switchMap(generateTagsFromPost)
    );

const ensureNicknamesExist = (post: Post) => of(post).pipe(
    switchMap(findNicknamesFromMentions),
    switchMap(({post, nicknames}) => nicknames.length ? combineLatest(nicknames.map(
            nick => pistolRead(getPistol(), reachIdxKey(`nickname.${nick}`)).pipe(
                skipWhile(({value}) => !value),
            timeout({
                each: 2000,
                with: () => throwError(() => {
                    throw {code: 'NICKNAME_NOT_FOUND', nickname: `@${nick}`}
                })
            })
        )
    )).pipe(
        first(),
        map(() => post)
    ) : of(post))
);

const writePostOwnerIdx = (post: Post) =>
    putPistolValue(userKey(post.owner, `posts.${keyFromIso(post.timestamp)}`), 'x').pipe(
        map(() => post)
    );


const generateMentionsFromPost = (post: Post) => of(post).pipe(
    switchMap(post => findNicknamesFromMentions(post)),
    switchMap(({post, nicknames}) => nicknames.length ? (
        from(nicknames).pipe(
            mergeMap(nickname => writeMentionIdx(post, nickname)),
            last(),
            map(() => post),
        )
    ) : of(post))
);

const generateTagsFromPost = (post: Post) => of(post).pipe(
    switchMap(post => findTagsFromPost(post)),
    switchMap(({post, tags}) => tags.length ? (
        from(tags).pipe(
            mergeMap(tag => writeTagIdx(post, tag)),
            last(),
            map(() => post)
        )
    ) : of(post))
);

const writeMentionIdx = (post: Post, nickname: string) =>
    getOwnerFromNickname(nickname).pipe(
        switchMap(({owner}) => putPistolValue(userKey(owner, `mentions.${keyFromIso(post.timestamp)}`), 'x'))
    );

const writeTagIdx = (post: Post, tag: string) =>
    combineLatest([
        // write a post tag index
        putPistolValue(tagPostIdxKey(tag, keyFromIso(post.timestamp)), 'x'),
        // write a tag index
        putPistolValue(`${tagsBase()}.${tag}`, 'x')
    ]);

export const tagSearch = (query: string) => {
    return pistolKeys(getPistol(), tagsBase(), {gte: query, lt: `${query}z`, limit: 10});
}


export const usePost = (key: string) => {
    const text = usePistolValue<string>(postKey(key, 'text'));
    const owner = usePistolValue<string>(postKey(key, 'owner'));
    const timestamp = usePistolValue<string>(postKey(key, 'timestamp'));
    return {text, owner, timestamp};
};

const keyFromIso = (iso: string) =>
    iso.replace(/\./g, '-');
