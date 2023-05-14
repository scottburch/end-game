import {firstValueFrom, map, of, tap} from "rxjs";
import {deserializer, serializer} from "./serializer.js";
import {expect} from "chai";


describe('seralizer', () => {
    it('should serialize an object with a Uint8Array', () =>
        firstValueFrom(of({num: 10, str: 'testing', bool: true, bytes: new Uint8Array([50, 100, 150, 200])}).pipe(
            map(serializer),
            map(deserializer),
            tap(x => expect(x.bytes).to.deep.equal(new Uint8Array([50, 100, 150, 200])))
        ))
    )
});