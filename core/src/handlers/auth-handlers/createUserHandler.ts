import {HandlerFn} from "../../app/endgameConfig.js";
import {map, of, switchMap, tap} from "rxjs";
import {generateNewAccount, serializeKeys} from "../../crypto/crypto.js";
import {AuthenticatedEndgame, endgamePut} from "../../app/endgame.js";

export const createUserHandler: HandlerFn<'login'> = ({endgame, username, password, userPath}) =>
    generateNewAccount().pipe(
        map(keys => ({
            endgame: {...endgame as AuthenticatedEndgame, keys, username},
            keys
        })),
        switchMap(({endgame, keys}) => serializeKeys(keys, password).pipe(map(keys => ({endgame, keys})))),
        switchMap(({endgame, keys}) => endgamePut(endgame, userPath, JSON.stringify({username, keys}))),
        map(({endgame}) => ({endgame, username, password, userPath}))
    )

