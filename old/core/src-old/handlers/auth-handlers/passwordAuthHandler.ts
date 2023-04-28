import {HandlerFn} from "../../app/endgameConfig";
import {catchError, filter, map, of, switchMap, throwError, timeout} from "rxjs";
import {AuthenticatedEndgame, endgameGet} from "../../app/endgame";
import {deserializeKeys} from "../../crypto/crypto";

export const passwordAuthHandler: HandlerFn<'login'> = ({endgame, username, password, userPath}) =>
    endgameGet<string>(endgame, userPath).pipe(
        filter(({value}) => value !== undefined),
        timeout(endgame.config.remoteWaitTime),
        map(({value}) => JSON.parse(value)),
        switchMap(value => deserializeKeys(value.keys, password)),
        map(keys => ({...endgame, keys, username, userPath} as AuthenticatedEndgame)),
        map(endgame => ({endgame, username, password, userPath})),
        catchError(err => err.name === 'TimeoutError' ? of({endgame, username, password, userPath}) : throwError(err)),
    );
