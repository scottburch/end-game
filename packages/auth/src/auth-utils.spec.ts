import {firstValueFrom, switchMap, tap} from "rxjs";
import {graphWithAuth} from "./test/testUtils.js";
import {doesAuthNodeExist} from "./auth-utils.js";
import {expect} from "chai";
import {graphNewAuth} from "./user-auth.js";

describe('auth utils', () => {

    describe('doesAuthNodeExist()', () => {
        it('should return false after some time if node does not exist', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => doesAuthNodeExist(graph, 'me')),
                tap(({exists}) => expect(exists).to.be.false)
            ))
        );

        it('should return true if the auth node does exist', () =>
            firstValueFrom(graphWithAuth().pipe(
                switchMap(graph => graphNewAuth(graph, 'scott', 'pass')),
                switchMap(({graph}) => doesAuthNodeExist(graph, 'scott')),
                tap(({exists}) => expect(exists).to.be.true)
            ))
        )
    })
})