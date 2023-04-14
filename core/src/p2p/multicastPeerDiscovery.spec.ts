import {startTestNetwork} from "../test/testUtils.js";
import {bufferCount, delay, filter, first, map, merge, switchMap} from "rxjs";
import {multicastPeerDiscovery} from "./multicastPeerDiscovery.js";
import {endgameGet, endgamePut} from "../app/endgame.js";

describe.skip('multicast peer discovery', function()  {
    this.timeout(10_000);
    it('should discover a peer', (done) => {
        startTestNetwork([[], []]).pipe(
            switchMap(pistols => merge(
                multicastPeerDiscovery(pistols[0], 9876, {redialInterval: 1}),
                multicastPeerDiscovery(pistols[1], 9876, {redialInterval: 1})
            )),
            bufferCount(2),
            delay(5000),
            switchMap(pistols => endgamePut(pistols[0], 'my.key', 'my-value').pipe(map(() => pistols))),
            delay(100),
            switchMap(pistols => endgameGet(pistols[1], 'my.key')),
            filter(({value}) => value === 'my-value'),
            first()
        ).subscribe(() => done())
    });
});