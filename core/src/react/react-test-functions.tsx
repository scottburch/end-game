import {pistolAuth, pistolPut, pistolRead, startPistol, dialPeerConnection, dialPeer, PistolKeysOptions} from "../../lib/index-browser.js";
import {from, last, map, mergeMap, switchMap, take, tap, toArray} from "rxjs";
import * as rxjs from 'rxjs'
import {
    startPistolReact,
    usePistolValue,
    usePistolKeys, pistolLogin, pistolLogout, getPistol
} from "../../lib/react/react-pistol.js";
import {createRoot} from "react-dom/client.js";
import {putPistolValue} from "../../lib/react/react-pistol.js";
import {AbstractKeyIteratorOptions} from "abstract-level";



const w = window as any;
w.rxjs = rxjs

export type ValueProps = {
    path?: string
    value?: any
}

export type AuthProps = {
    username?: string
    password?: string
}

export type DialProps = {
    url?: string
}


w.startPistol = () => startPistol().pipe(
    tap(pistol => w.pistol = pistol)
)

w.auth = (config: AuthProps = {}) =>
    pistolAuth(w.pistol, config.username ?? 'username', config.password ?? 'password').pipe(
        tap(pistol => w.pistol = pistol)
    )

w.dialPeer = (config: DialProps = {}) =>
    dialPeer(w.pistol, config.url ?? 'ws://localhost:11110', {redialInterval: 1});




w.putValue = (config: ValueProps) =>
    pistolPut(w.pistol, config.path ?? 'my.path', config.value ?? 'my-value');


w.readValue = (n: number = 1, config: ValueProps = {}) => pistolRead(w.pistol, config.path ?? 'my.path').pipe(
    map(obj => obj.value),
    take(n),
    toArray(),
);

//******* REACT STUFF *********

export const renderListComponent = w.renderListComponent = (list: string[], options: PistolKeysOptions = {}) => {
    const TestComponent: React.FC = () => {
        const keys = usePistolKeys('my.path', options);
        return <div id="my-keys">{keys.map(key => <div id={key}  className="key-item" key={key}>{key}</div>)}</div>
    }

    return startPistolReact().pipe(
        mergeMap(() => pistolLogin('username', 'password')),
        switchMap(() => from(list).pipe(
            mergeMap(it => putPistolValue(`my.path.${it}`, it)),
            last()
        )),
        map(() => createRoot(document.querySelector('#app'))),
        tap(root => root.render(<TestComponent/>))
    )
}


export const renderKeysComponent = w.renderKeysComponent = (options: PistolKeysOptions = {}) => {

    const TestComponent: React.FC = () => {
        const keys = usePistolKeys('my.path', options);
        return <div data-test-component="keys">{keys.map(key => <div id={key} key={key}>{key}</div>)}</div>
    }

    return startPistolReact().pipe(
        mergeMap(() => dialPeerConnection('ws://localhost:11110', {})),
        switchMap(() => pistolLogin('username', 'password')),
        map(() => createRoot(document.querySelector('#app'))),
        tap(root => root.render(<TestComponent/>))
    );
};

w.startPistolReact =  startPistolReact;
w.dialPeerConnection = dialPeerConnection;
w.pistolLogin = pistolLogin;
w.pistolLogout = pistolLogout;
w.getPistol = getPistol;

w.renderReadComponent = () => {

    const TestComponent: React.FC = () => {
        const value = usePistolValue('my.path');
        return <>value: <span id="value">{value}</span></>
    }

    return startPistolReact().pipe(
        switchMap(() => pistolLogin('username', 'password')),
        map(() => createRoot(document.querySelector('#app'))),
        tap(root => root.render(<TestComponent/>))
    )

};

w.putPistolValue = (path: string, value: string) => putPistolValue(path, value);

w.reactDialPeer = (config: DialProps = {}) =>
    dialPeerConnection(config.url ?? 'ws://localhost:11110', {});


