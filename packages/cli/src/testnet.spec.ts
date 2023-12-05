import {delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {installCli} from "./test/testUtils.js";
import {$, fs} from "zx";
import {addThingNode, startTestNode} from "@end-game/test-utils";
import {expect} from "chai";
import {asPeerId} from "@end-game/p2p";
import {asNodeId, getNode} from "@end-game/graph";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";

describe('testnet command', function () {
    this.timeout(60_000);
    it('should start a testnet with two nodes by default', () =>
        firstValueFrom(installCli().pipe(
            map(() => $`endgame testnet`),
            delay(3000),
            switchMap(proc => of(undefined).pipe(
                switchMap(() => startTestNode(2, [0, 1])),
                delay(1000),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-0'))).to.be.true),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-1'))).to.be.true),
                tap(x => x),
                switchMap(() => proc.kill())
            ))
        ))
    );

    it('should start a testnet with the named number of nodes', () =>
        firstValueFrom(installCli().pipe(
            map(() => $`endgame testnet -c 3`),
            delay(3000),
            switchMap(proc => of(undefined).pipe(
                switchMap(() => startTestNode(3, [0, 1, 2])),
                delay(1000),
                tap(({host}) => expect(host.peerConnections).to.have.length(3)),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-0'))).to.be.true),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-1'))).to.be.true),
                tap(({host}) => expect(host.peerConnections.has(asPeerId('host-2'))).to.be.true),
                tap(x => x),
                switchMap(() => proc.kill())
            ))
        ))
    );


    it('should start a testnet allowing you to pass graphs', () =>
        firstValueFrom(installCli().pipe(
            map(() => $`endgame testnet -g testnet`),
            delay(3000),
            switchMap(proc => of(undefined).pipe(
                switchMap(() => startTestNode(2, [0])),
                delay(1000),
                switchMap(({host}) => graphNewAuth(host.graphs[0], 'scott', 'scott')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'scott')),
                switchMap(({graph}) => addThingNode(graph, 0)),
                switchMap(() => startTestNode(3, [1])),
                delay(1000),
                switchMap(({host}) => getNode(host.graphs[0], asNodeId('thing0000'), {})),
                tap(({node}) => expect(node.props.name).to.equal('thing0000')),
                switchMap(() => proc.kill())
            ))
        ))
    );

    it('should allow a directory to be set to store the db', () =>
        firstValueFrom(installCli().pipe(
            switchMap(() => $`rm -rf test-store`),
            map(() => $`endgame testnet -g testnet -d test-store`),
            delay(3000),
            switchMap(proc => of(undefined).pipe(
                switchMap(() => startTestNode(2, [0])),
                delay(1000),
                switchMap(({host}) => graphNewAuth(host.graphs[0], 'scott', 'scott')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'scott')),
                switchMap(({graph}) => addThingNode(graph, 0)),
                switchMap(() => startTestNode(3, [1])),
                delay(1000),
                switchMap(({host}) => getNode(host.graphs[0], asNodeId('thing0000'), {})),
                tap(({node}) => expect(node.props.name).to.equal('thing0000')),
                switchMap(() => fs.pathExists('test-store/node-0')),
                tap(exists => expect(exists).to.be.true),
                switchMap(() => fs.pathExists('test-store/node-1')),
                tap(exists => expect(exists).to.be.true),
                switchMap(() => proc.kill())
            ))
        ))
    );

    it("should not error out the testnet command on an error, should log instead", (done) => {
        firstValueFrom(installCli().pipe(
            map(() => $`endgame testnet -g testnet -l debug`),
            delay(1000),
            switchMap(proc => of(undefined).pipe(
                tap(() => proc.stdout.on('data', out =>
                    /USERNAME_ALREADY_EXISTS/.test(out) && proc.kill().then(() => done())
                )),
                switchMap(() => startTestNode(2, [0])),
                switchMap(({host}) => graphNewAuth(host.graphs[0], 'scott', 'scott')),
                delay(1000),
                switchMap(() => startTestNode(3, [1])),
                switchMap(({host}) => graphNewAuth(host.graphs[0], 'scott', 'scott')),
            )),
        ))
    });
});