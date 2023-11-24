import {delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {installCli} from "./test/testUtils.js";
import {$} from "zx";
import {startTestNode} from "@end-game/test-utils";
import {expect} from "chai";
import {asPeerId} from "@end-game/p2p";

describe('testnet command', function()  {
    this.timeout(60_000);
    it('should start a testnet with two nodes', () =>
        firstValueFrom(installCli().pipe(
            map(() => $`endgame testnet`),
            delay(3000),
            switchMap(proc => of(undefined).pipe(
                switchMap(() => startTestNode(2, [0,1])),
                delay(1000),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-0'))).to.be.true),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-1'))).to.be.true),
                tap(x => x),
                switchMap(() => proc.kill())
            ))
        ))
    );
});