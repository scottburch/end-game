import {Endgame} from "./endgame.js";
import {EndgameConfig} from "./endgameConfig.js";
import {bufferCount, firstValueFrom, map, merge, of, switchMap, take, tap, toArray} from 'rxjs'
import {expect} from "chai";
import {nullHandler} from "../handlers/handlers.js";

describe('endgameConfig', () => {
    it('should allow handlers to have multiple listeners', () =>
        firstValueFrom(of({
            handlers: {
                logout: nullHandler()
            }
        } as EndgameConfig).pipe(
            switchMap(config => merge(
                config.handlers.logout.next({endgame: {config: {name: 'my-endgame'}} as Endgame}),
                config.handlers.logout.next({endgame: {config: {name: 'my-endgame'}} as Endgame}),
                config.handlers.logout.next({endgame: {config: {name: 'my-endgame'}} as Endgame}),
            )),
            map(({endgame}) => endgame.config.name),
            bufferCount(3),
            tap(names => expect(names).to.deep.equal(['my-endgame','my-endgame', 'my-endgame']))
        ))
    );
})