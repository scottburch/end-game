import {Endgame} from "./endgame.js";
import {EndgameConfig} from "./endgameConfig.js";
import {firstValueFrom, map, merge, of, switchMap, take, tap, toArray} from 'rxjs'
import {expect} from "chai";
import {nullHandler} from "../handlers/handlers.js";

describe('endgameConfig', () => {
    it('should allow handlers to have multiple listeners', () =>
        firstValueFrom(of({
            handlers: {
                logout: nullHandler()
            }
        } as EndgameConfig).pipe(
            tap(config => setTimeout(() => config.handlers.logout.next({endgame: {config: {name: 'my-endgame'}} as Endgame}))),
            switchMap(config => merge(
                config.handlers.logout,
                config.handlers.logout,
                config.handlers.logout
            )),
            take(3),
            map(({endgame}) => endgame.config.name),
            toArray(),
            tap(names => expect(names).to.deep.equal(['my-endgame','my-endgame', 'my-endgame']))
        ))
    );
})