import {
    AuthenticatedEndgame, endgameAuth, EndgameOpts, endgameUnAuth,
    newEndgame, Endgame
} from "../app/endgame.js";
import {EndgameGraphValue, endgameKeys, EndgameKeysOptions, endgamePut, endgameRead} from "../graph/endgameGraph.js";
import {map, merge, tap} from "rxjs";
import {useEffect, useState} from "react";
import {dialPeer, DialPeerOpts} from "../p2p/networkClient.js";




const w = window as unknown as {endgame: Endgame};


export const getEndgame = () => w.endgame;

export const startEndgameReact = (opts: EndgameOpts = {config: {}}) => newEndgame({
    ...opts,
}).pipe(
    tap(p => w.endgame = p)
);


export const usePistolValue = <T extends EndgameGraphValue>(path: string, defaultValue: T | undefined = undefined) => {
    const [value, setValue] = useState<T | undefined>(defaultValue);

    useEffect(() => {
        const sub = endgameRead<T>(w.endgame, path).pipe(
            map(({value}) => value)
        ).subscribe(v => setValue(v));
        return () => sub.unsubscribe();
    }, []);
    return value;
}
export const usePistolKeys = (base: string, options: EndgameKeysOptions = {}) => {
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        const sub = endgameKeys(w.endgame, base, options).pipe(
            map(({keys}) => keys)
        ).subscribe(keys => setKeys(keys))
        return () => sub.unsubscribe();
    }, []);
    return keys;
};



export const usePistolAuth = () => {
    const id = (w.endgame as AuthenticatedEndgame).id.split('-')[0];

    const [auth, setAuth] = useState<Pick<AuthenticatedEndgame, 'keys' | 'username' | 'id'>>({
        keys: (w.endgame as AuthenticatedEndgame).keys,
        username: (w.endgame as AuthenticatedEndgame).username,
        id: id === '0' ? '' : id
    });

    useEffect(() => {
        const sub = merge(
            (w.endgame as Endgame).config.chains.auth,
            (w.endgame as Endgame).config.chains.unauth,
        ).pipe(
            map(({endgame}) => endgame as AuthenticatedEndgame),
            tap(setAuth)
        ).subscribe();
        return () => sub.unsubscribe();
    });
    return auth
};


export const putPistolValue = (path: string, value: any) => endgamePut(w.endgame as AuthenticatedEndgame, path, value);

export const endgameLogin = (username: string, password: string) => endgameAuth(w.endgame, username, password).pipe(
    tap(p => w.endgame = p),
);

export const endgameLogout = () => endgameUnAuth(w.endgame as AuthenticatedEndgame).pipe(
    tap(p => w.endgame = p)
);

export const dialPeerConnection = (url: string, opts: DialPeerOpts) =>
    dialPeer(w.endgame, url, ({...opts, redialInterval: opts.redialInterval || 1}));

