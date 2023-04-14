import {Pistol} from "./pistol.js";
import {newPistolConfig} from "./pistolConfig.js";
import {firstValueFrom, map, merge, of, switchMap, take, tap, toArray} from 'rxjs'
import {expect} from "chai";

describe('pistolConfig', () => {
    it('should allow chains to have multiple listeners', () =>
        firstValueFrom(of(newPistolConfig({})).pipe(
            tap(config => setTimeout(() => config.chains.unauth.next({pistol: {config: {name: 'my-pistol'}} as Pistol}))),
            switchMap(config => merge(
                config.chains.unauth,
                config.chains.unauth,
                config.chains.unauth
            )),
            take(3),
            map(({pistol}) => pistol.config.name),
            toArray(),
            tap(names => expect(names).to.deep.equal(['my-pistol','my-pistol', 'my-pistol']))
        ))
    );
})