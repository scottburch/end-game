import {delay, first, firstValueFrom, last, mergeMap, of, range, switchMap, tap} from "rxjs";
import {addThingNode, getAGraph} from "@end-game/test-utils";
import {nodesByLabel, nodesByProp} from "./graph.js";
import {expect} from "chai";

describe('paging', () => {
    it('should allow paging for nodesByLabel', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => of(graph).pipe(
                switchMap(graph => range(1,15).pipe(
                    mergeMap(n => addThingNode(graph, n)),
                    last()
                )),
                switchMap(() => nodesByLabel(graph, 'thing', {limit: 5}).pipe(first())),
                tap(({nodes}) => {
                    expect(nodes[0].nodeId).to.equal('thing0001');
                    expect(nodes[4].nodeId).to.equal('thing0005');
                }),
                delay(1),
                switchMap(() => nodesByLabel(graph, 'thing', {limit: 5, gt: 'thing0005'})),
                tap(({nodes}) => {
                    expect(nodes[0].nodeId).to.equal('thing0006');
                    expect(nodes[4].nodeId).to.equal('thing0010');
                })
            ))
        ))
    );

    it('should allow paging for nodesByProp()', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => of(graph).pipe(
                switchMap(graph => range(1, 15).pipe(
                    mergeMap(n => addThingNode(graph, n)),
                    last()
                )),
                switchMap(() => nodesByProp(graph, 'thing', 'name', '*', {limit: 5})),
                tap(({nodes}) => {
                    expect(nodes[0].nodeId).to.equal('thing0001');
                    expect(nodes[4].nodeId).to.equal('thing0005');
                }),
                delay(1),
                switchMap(() => nodesByProp(graph, 'thing', 'name', '', {limit: 5, gt: 'thing0005'})),
                tap(({nodes}) => {
                    expect(nodes[0].nodeId).to.equal('thing0006');
                    expect(nodes[4].nodeId).to.equal('thing0010');
                })

            ))
        ))
    )
});