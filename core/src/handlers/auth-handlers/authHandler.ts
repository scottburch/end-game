import {HandlerFn} from "../../app/endgameConfig.js";
import {catchError, filter, map, of, throwError, timeout} from "rxjs";
import {endgameGet} from "../../app/endgame.js";

export const passwordAuthHandler: HandlerFn<'login'> = ({endgame, username, password, userPath}) =>
    endgameGet(endgame, userPath).pipe(
        filter(({value}) => value !== undefined),
        timeout(endgame.config.remoteWaitTime),
        map(() => ({endgame, username, password, userPath})),
        catchError(err => err.name === 'TimeoutError' ? of({endgame, username, password, userPath}) : throwError(err))
    )
