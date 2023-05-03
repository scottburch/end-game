import {firstValueFrom} from "rxjs";
import {newUser} from "./user.js";

describe('user module', () => {
    it('should create a user object in the graph', () =>
        firstValueFrom(newUser({
            username,
            password,

        }))
    )
});