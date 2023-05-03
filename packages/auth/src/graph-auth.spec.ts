import {firstValueFrom, of, raceWith, switchMap, tap, timer} from "rxjs";
import {graphAuth} from "./graph-auth.js";
import {getAGraph} from "@end-game/graph/testUtils";


describe('graph auth', () => {
   it('should fail authentication if a user does not exist', () =>
       firstValueFrom(getAGraph().pipe(
           switchMap(graph => graphAuth({graph, username: 'scott', password: 'pass'})),
            tap(x => x)
       ))
   )
});