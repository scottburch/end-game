import {map, Subject, switchMap} from "rxjs";
import {Handler, HandlerProps} from "../app/endgameConfig.js";
import {AuthenticatedEndgame} from "../app/endgame.js";
import {getTestKeys} from "../test/testUtils.js";

export const unauthHandler = () => {
    const subject = new Subject<HandlerProps<'auth'>>();
    const observer = subject.asObservable().pipe(
        switchMap(({endgame, password, userPath, username}) => getTestKeys().pipe(
            map(keys => ({...endgame, keys, username} satisfies AuthenticatedEndgame as AuthenticatedEndgame)),
            map(endgame => ({endgame, password, userPath, username}))
        ))
    ) as unknown as Handler<HandlerProps<'auth'>>;

    observer.next = (v: HandlerProps<'auth'>) => subject.next(v);
    return observer
};
