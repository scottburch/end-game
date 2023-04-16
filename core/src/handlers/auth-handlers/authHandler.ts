import {HandlerFn} from "../../app/endgameConfig.js";
import {filter, map} from "rxjs";
import {endgameGet} from "../../app/endgame.js";

export const passwordAuthHandler: HandlerFn<'auth'> = ({endgame, username, password, userPath}) =>
    endgameGet(endgame, userPath).pipe(
        filter(({value}) => value !== undefined),
        map(() => ({endgame, username, password, userPath}))
    )
