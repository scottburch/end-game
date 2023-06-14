import {combineLatest, first, firstValueFrom, from, map, skipWhile, switchMap, tap, toArray} from "rxjs";
import {getAGraph} from "@end-game/test-utils";
import {putNode, newNode, nodesByLabel} from "./graph.js";
import {expect} from "chai";

describe('nodesByLabel()', () => {
    it('should be able to find nodes with a given label', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => setTimeout(() => putNode(graph, newNode('', 'person', {name: 'joe'})).subscribe(), 100)),
            switchMap(graph => combineLatest([
                putNode(graph, newNode('', 'person', {name: 'scott'})),
                putNode(graph, newNode('', 'person', {name: 'todd'}))
            ])),
            switchMap(([{graph}]) => nodesByLabel<{ name: string }>(graph, 'person')),
            skipWhile(({nodes}) => nodes.length < 3),
            first(),
            switchMap(({nodes}) => from(nodes || [])),
            map(node => node.props.name),
            toArray(),
            tap(names => {
                expect(names).to.have.length(3);
                expect(names.sort()).to.deep.equal(['joe', 'scott', 'todd']);
            }),
        ))
    );

    it('should update a nodesByLabel() when node nodes are updated', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => putNode(graph, newNode('', 'person', {name: 'scott'}))),
            tap(({graph}) => setTimeout(() => putNode(graph, newNode('', 'person', {name: 'todd'})).subscribe())),
            tap(({graph}) => setTimeout(() => putNode(graph, newNode('', 'person', {name: 'joe'})).subscribe())),
            switchMap(({graph}) => nodesByLabel(graph, 'person')),
            skipWhile(({nodes}) => nodes.length < 3),
            tap(({nodes}) => {
                expect(nodes.map(node => node.props.name).sort()).to.deep.equal(['joe', 'scott', 'todd'])
            })
        ))
    );
});
