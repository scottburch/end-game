import {combineLatest, first, firstValueFrom, from, map, skipWhile, switchMap, tap, toArray} from "rxjs";
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
            tap(({graph}) => setTimeout(() => graphPut(graph, '', 'person', {name: 'joe'}).subscribe())),
            switchMap(({graph}) => nodesByLabel(graph, 'person')),
            skipWhile(({nodes}) => nodes.length < 3),
            tap(({nodes}) => {
                expect(nodes.map(node => node.props.name).sort()).to.deep.equal(['joe', 'scott', 'todd'])
            })
        ))
    )

});
