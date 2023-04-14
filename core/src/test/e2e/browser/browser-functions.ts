import * as rxjs from "rxjs";
import {first, skipWhile, tap} from "rxjs";
import {pistolAuth, newPistol} from "../../../app/pistol.js";
import {dialPeer} from "../../../p2p/networkClient.js";
import {PistolGraphValue, pistolPut, pistolRead} from "../../../graph/pistolGraph.js";

const w = (window as any).w = window as any;


w.rxjs = rxjs;

w.startPistol = () => newPistol().pipe(
    tap(pistol => w.pistol = pistol)
);

type AuthProps = {
    username?: string
    password?: string
}

w.auth = (config: AuthProps = {}) =>
    pistolAuth(w.pistol, config.username ?? 'username', config.password ?? 'password').pipe(
        tap(pistol => w.pistol = pistol)
    );


w.dialPeer = () =>
    dialPeer(w.pistol, 'ws://localhost:11110', {redialInterval: 1});

w.pistolPut = (key: string, value: PistolGraphValue) =>
    pistolPut(w.pistol, key, value);

w.pistolRead = (key: string, expectedValue: PistolGraphValue) =>
    pistolRead(w.pistol, key).pipe(
        skipWhile(({value}) => value !== expectedValue),
        first()
    );

w.log = (text: string) => console.log(text);



