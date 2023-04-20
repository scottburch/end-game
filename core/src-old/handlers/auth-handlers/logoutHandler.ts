import {HandlerFn} from "../../app/endgameConfig.js";
import {Endgame} from "../../app/endgame.js";
import {of} from "rxjs";
import ld from "lodash";

export const logoutHandler: HandlerFn<'logout'> = ({endgame}) =>
    of({endgame: ld.omit(endgame, 'keys', 'username') satisfies Endgame as Endgame})
