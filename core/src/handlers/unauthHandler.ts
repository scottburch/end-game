import {map, Subject, switchMap} from "rxjs";
import {ChainPair, ChainProps} from "../app/pistolConfig.js";
import {AuthenticatedPistol} from "../app/pistol.js";
import {getTestKeys} from "../test/testUtils.js";

export const unauthHandler = () => {
    const subject = new Subject<ChainProps<'auth'>>();
    const observer = subject.asObservable().pipe(
        switchMap(({pistol, password, userPath, username}) => getTestKeys().pipe(
            map(keys => ({...pistol, keys, username} satisfies AuthenticatedPistol as AuthenticatedPistol)),
            map(pistol => ({pistol, password, userPath, username}))
        ))
    ) as unknown as ChainPair<ChainProps<'auth'>>;

    observer.next = (v: ChainProps<'auth'>) => subject.next(v);
    return observer
};
