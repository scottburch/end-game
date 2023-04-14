import {HandlerFn} from "../../app/endgameConfig";
import {Endgame} from "../../app/endgame";
import {of} from "rxjs";
import ld from "lodash";

export const logoutHandler: HandlerFn<'logout'> = ({endgame}) =>
    of({endgame: ld.omit(endgame, 'keys', 'username') satisfies Endgame as Endgame})
