import {firstValueFrom, map, mergeMap, of, range, skip, switchMap, tap} from "rxjs";
import {addThingNode, startTestNet} from "@end-game/test-utils";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {asNodeId, getNode} from "@end-game/graph";
import {expect} from "chai";


describe('p2p performance', function()  {
    it.skip('should perform well', () => {
        let start: number;
        const count = 1000;
        return firstValueFrom(startTestNet([[1], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                tap(() => start = Date.now()),
                switchMap(() => range(0, count)),
                mergeMap(n => addThingNode(host0.graphs[0], n, {name: `thing${n}`})),
                skip(count - 1),
                tap(() => {
                    console.log(Date.now() - start);
                    start = Date.now();
                }),
                switchMap(() => range(0, count)),
                mergeMap(n => getNode(host1.graphs[0], asNodeId(`thing${n}`), {})),
                map(({node}, idx) => expect(node.props.name).to.equal(`thing${idx}`)),
                skip(count - 1),
                tap(() => {
                    console.log(Date.now() - start);
                })
            ))
        ))
    })
});


