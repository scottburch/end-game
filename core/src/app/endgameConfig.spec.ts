import {Endgame} from "./endgame.js";
import {newEndgameConfig} from "./endgameConfig.js";
import {firstValueFrom, map, merge, of, switchMap, take, tap, toArray} from 'rxjs'
import {expect} from "chai";

describe('endgameConfig', () => {
    it('should allow handlers to have multiple listeners', () =>
        firstValueFrom(of(newEndgameConfig({})).pipe(
            tap(config => setTimeout(() => config.handlers.unauth.next({endgame: {config: {name: 'my-endgame'}} as Endgame}))),
            switchMap(config => merge(
                config.handlers.unauth,
                config.handlers.unauth,
                config.handlers.unauth
            )),
            take(3),
            map(({endgame}) => endgame.config.name),
            toArray(),
            tap(names => expect(names).to.deep.equal(['my-endgame','my-endgame', 'my-endgame']))
        ))
    );
})