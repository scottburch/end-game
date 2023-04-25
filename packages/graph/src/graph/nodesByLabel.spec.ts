import {bufferCount, combineLatest, first, firstValueFrom, from, map, switchMap, tap, toArray} from "rxjs";
import {getAGraph} from "../test/testUtils.js";
import {graphPut, nodesByLabel} from "./graph.js";
import {expect} from "chai";

describe('nodesByLabel()', () => {
    it('should be able to find nodes with a given label', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, '', 'person', {name: 'scott'}),
                graphPut(graph, '', 'person', {name: 'todd'})
            ])),
            switchMap(([{graph}]) => nodesByLabel<{ name: string }>(graph, 'person')),
            first(),
            switchMap(({nodes}) => from(nodes || [])),
            map(node => node.props.name),
            toArray(),
            tap(names => {
                expect(names).to.have.length(2);
                expect(names).to.include('scott');
                expect(names).to.include('todd');
            }),
        ))
    );

    it('should update a nodesByLabel() when node nodes are updated', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphPut(graph, '', 'person', {name: 'scott'})),
            tap(({graph}) => setTimeout(() => graphPut(graph, '', 'person', {name: 'todd'}).subscribe())),
            switchMap(({graph}) => nodesByLabel(graph, 'person')),
            bufferCount(2),
            tap(([{nodes: n1}, {nodes: n2}]) => {
                expect(n1).to.have.length(1);
                expect(n2).to.have.length(2);
                expect(n1[0].props.name).to.equal('scott');
                expect(['scott', 'todd']).to.include(n2[0].props.name);
                expect(['scott', 'todd']).to.include(n2[1].props.name);
            })
        ))
    )

});
