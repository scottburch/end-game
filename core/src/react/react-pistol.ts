import {
    AnyPistol,
    AuthenticatedPistol, pistolAuth, PistolOpts, pistolUnAuth,
    newPistol, Pistol
} from "../app/pistol.js";
import {PistolGraphValue, pistolKeys, PistolKeysOptions, pistolPut, pistolRead} from "../graph/pistolGraph.js";
import {map, merge, tap} from "rxjs";
import {useEffect, useState} from "react";
import {dialPeer, DialPeerOpts} from "../p2p/networkClient.js";
import {ChainAuthChange, pistolChainListen} from "../app/pistolChains.js";



const w = window as unknown as {pistol: AnyPistol<any>};


export const getPistol = () => w.pistol;

export const startPistolReact = (opts: PistolOpts = {}) => newPistol({
    ...opts,
}).pipe(
    tap(p => w.pistol = p)
);


export const usePistolValue = <T extends PistolGraphValue>(path: string, defaultValue: T | undefined = undefined) => {
    const [value, setValue] = useState<T | undefined>(defaultValue);

    useEffect(() => {
        const sub = pistolRead<T>(w.pistol, path).pipe(
            map(({value}) => value)
        ).subscribe(v => setValue(v));
        return () => sub.unsubscribe();
    }, []);
    return value;
}
export const usePistolKeys = (base: string, options: PistolKeysOptions = {}) => {
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        const sub = pistolKeys(w.pistol, base, options).pipe(
            map(({keys}) => keys)
        ).subscribe(keys => setKeys(keys))
        return () => sub.unsubscribe();
    }, []);
    return keys;
};



export const usePistolAuth = () => {
    const id = (w.pistol as AuthenticatedPistol).id.split('-')[0];

    const [auth, setAuth] = useState<Pick<AuthenticatedPistol, 'keys' | 'username' | 'id'>>({
        keys: (w.pistol as AuthenticatedPistol).keys,
        username: (w.pistol as AuthenticatedPistol).username,
        id: id === '0' ? '' : id
    });

    useEffect(() => {
        const sub = merge(
            (w.pistol as Pistol).config.chains.auth,
            (w.pistol as Pistol).config.chains.unauth,
        ).pipe(
            map(({pistol}) => pistol as AuthenticatedPistol),
            tap(setAuth)
        ).subscribe();
        return () => sub.unsubscribe();
    });
    return auth
};


export const putPistolValue = (path: string, value: any) => pistolPut(w.pistol as AuthenticatedPistol, path, value);

export const pistolLogin = (username: string, password: string) => pistolAuth(w.pistol, username, password).pipe(
    tap(p => w.pistol = p),
);

export const pistolLogout = () => pistolUnAuth(w.pistol as AuthenticatedPistol).pipe(
    tap(p => w.pistol = p)
);

export const dialPeerConnection = (url: string, opts: DialPeerOpts) =>
    dialPeer(w.pistol, url, ({...opts, redialInterval: opts.redialInterval || 1}));

