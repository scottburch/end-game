import {startTestNet, startTestNode} from "./test/testUtils.js";
import {delay, filter, firstValueFrom, merge, of, Subscription, switchMap, tap} from "rxjs";
import {expect} from "chai";
import {Graph} from "@end-game/graph";

describe("dialer", () => {
    it('should redial until it can get a connection', () =>
        firstValueFrom(startTestNode(0, [1]).pipe(
            delay(3000),
            switchMap(() => startTestNode(1)),
            switchMap(({graph}) => graph.chains.log),
            tap(({item}) => expect(item.text).to.contain('connection received'))
        ))
    );

    it('should redial if a peer connection is lost', () => {
        let peer1: Graph;
        let peer1Sub: Subscription;

        return firstValueFrom(startTestNode(0, [1]).pipe(
            tap(() => peer1Sub = startTestNode(1).subscribe(({graph}) => peer1 = graph)),
            switchMap(() => peer1.chains.log),
            filter(({item}) => item.text.includes('connection received')),
            tap(() => peer1Sub.unsubscribe()),
            delay(2000),
            switchMap(() => startTestNode(1)),
            switchMap(({graph}) => graph.chains.log),
            filter(({item}) => item.text.includes('connection received')),
            delay(500)
        ))
    });

    it('should reject duplicate connections', () =>
        firstValueFrom(startTestNet([[1], [0]]).pipe(
            switchMap(({node0, node1}) => merge(
                node0.chains.log,
                node1.chains.log
            )),
            filter(entry => !!entry)
        ))
    );
});