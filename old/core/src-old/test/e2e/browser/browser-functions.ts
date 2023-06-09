import * as rxjs from "rxjs";
import {first, skipWhile, tap} from "rxjs";
import {endgameLogin, newEndgame} from "../../../app/endgame";
import {dialPeer} from "../../../p2p/networkClient";
import {EndgameGraphValue, pistolPut, pistolRead} from "../../../graph/endgameGraph";

const w = (window as any).w = window as any;


w.rxjs = rxjs;

w.startPistol = () => newEndgame().pipe(
    tap(pistol => w.pistol = pistol)
);

type AuthProps = {
    username?: string
    password?: string
}

w.auth = (config: AuthProps = {}) =>
    endgameLogin(w.pistol, config.username ?? 'username', config.password ?? 'password').pipe(
        tap(pistol => w.pistol = pistol)
    );


w.dialPeer = () =>
    dialPeer(w.pistol, 'ws://localhost:11110', {redialInterval: 1});

w.pistolPut = (key: string, value: EndgameGraphValue) =>
    pistolPut(w.pistol, key, value);

w.pistolRead = (key: string, expectedValue: EndgameGraphValue) =>
    pistolRead(w.pistol, key).pipe(
        skipWhile(({value}) => value !== expectedValue),
        first()
    );

w.log = (text: string) => console.log(text);



