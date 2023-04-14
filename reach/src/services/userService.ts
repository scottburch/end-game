import {
    escapeKey,
    generateAccount, getPistol, pistolKeys,
    pistolLogin, pistolRead,
    putPistolValue,
    usePistolValue
} from "@scottburch/pistol";
import {combineLatest, filter, first, map, switchMap} from "rxjs";
import {reachIdxKey, reachKey} from "./reachService.js";


export type User = {
    username: string,
    password: string
}

export type UserProfile = {
    displayName: string
    nickname: string
    aboutMe: string
    owner: string
}

export const userKey = (pubKey: string, key: string) =>
    reachKey(`users.${pubKey}.${key}`);

export const useUserProfile = (owner: string) => {
    const displayName = usePistolValue<string>(userKey(owner, 'profile.displayName'));
    const nickname = usePistolValue<string>(userKey(owner, 'profile.nickname'));
    const aboutMe = usePistolValue<string>(userKey(owner, 'profile.aboutMe'));

    return {displayName: displayName ?? '', nickname: nickname ?? '', aboutMe: aboutMe ?? '', owner} satisfies UserProfile;
}

export const writeUserProfile = (pubKey: string, values: UserProfile) =>
    combineLatest([
        putPistolValue(userKey(pubKey, 'profile.displayName'), values.displayName),
        putPistolValue(userKey(pubKey,'profile.nickname'), values.nickname),
        putPistolValue(userKey(pubKey, 'profile.aboutMe'), values.aboutMe),

        putPistolValue(reachIdxKey(`nickname.${escapeKey(values.nickname).toLowerCase()}`), pubKey)
    ])

export const signup = (values: User & UserProfile) =>
    generateAccount(values.username + values.password, 'pistol').pipe(
        switchMap(acc => pistolLogin(values.username, values.password).pipe(
            map(() => acc)
        )),
        switchMap(acc => writeUserProfile(acc.pubKeyHex, values))
    );

export const nicknameSearch = (query: string) => {
    return pistolKeys(getPistol(), reachIdxKey('nickname'), {gte: query, lt: `${query}z`, limit: 10});
}


export const getOwnerFromNickname = (nickname: string) =>
    pistolRead<string>(getPistol(), reachIdxKey(`nickname.${nickname}`)).pipe(
        filter(({value}) => !!value),
        map(({value}) => ({owner: value})),
        first()
    )


