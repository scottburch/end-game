import {combineLatest, first, firstValueFrom, from, map, of, switchMap, tap, toArray} from "rxjs";
import {
    graphGet,
    graphGetEdge,
    graphGetRelatedNodes,
    graphOpen,
    graphPut,
    graphPutEdge,
    nodesByLabel
} from "./graph.js";
import {expect} from "chai";
import {getAGraph} from "../test/testUtils.js";
import {newUid} from "../utils/uid.js";

describe('graph', () => {
    it('should open a graph', () =>
        firstValueFrom(graphOpen({graphId: 'my.graph'}).pipe(
            tap(graph => expect(graph).not.to.be.undefined)
        ))
    );

    it('should put a value in a graph and assign an id', () =>
        firstValueFrom(graphOpen({graphId: 'my.graph'}).pipe(
            switchMap(graph => graphPut(graph, 'person', {name: 'scott'})),
            tap(({graph, nodeId}) => expect(nodeId).to.have.length(12))
        ))
    );

    it('should get an item from the graph by id', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphPut(graph, 'person', {name: 'scott'})),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('scott')),
            first(),
            switchMap(({graph}) => graphPut(graph, 'person', {name: 'todd'})),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('todd')),
        ))
    );

    it('should be able to add a relationship between two nodes', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, 'person', {name: 'scott'}),
                graphPut(graph, 'person', {name: 'todd'})
            ]).pipe(
                switchMap(arr => from(arr)),
                map(({nodeId}) => nodeId),
                toArray(),
                switchMap(([n1, n2]) => graphPutEdge(graph, 'friend', n1, n2, {foo: 10})),
                switchMap(({edge}) => graphGetEdge(graph, edge.edgeId)),
                tap(({edge}) => {
                    expect(edge?.label).to.equal('friend');
                    expect(edge?.edgeId).to.have.length(12);
                    expect(edge?.props).to.deep.equal({foo: 10});
                    expect(edge?.from).to.have.length(12);
                    expect(edge?.to).to.have.length(12);
                    expect(edge?.from).to.not.equal(edge?.to);
                }),
            )),
        ))
    );

    it('should be able to find nodes with a given label', () =>
        firstValueFrom(getAGraph({graphId: newUid()}).pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, 'person', {name: 'scott'}),
                graphPut(graph, 'person', {name: 'todd'})
            ])),
            switchMap(([{graph}]) => nodesByLabel<{ name: string }>(graph, 'person')),
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

    it('should be able to find nodes with a given relationship', () =>
        firstValueFrom(getAGraph({graphId: newUid()}).pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, 'person', {name: 'scott'}),
                graphPut(graph, 'person', {name: 'todd'})
            ])),
            switchMap(([{graph, nodeId: id1}, {nodeId: id2}]) =>
                graphPutEdge(graph, 'friend', id1, id2, {rank: 5})
            ),
            switchMap(({graph, edge}) => graphGetRelatedNodes<{name: string}>(graph, edge.from, 'friend')),
            tap(({relationships}) => {
                expect(relationships).to.have.length(1);
                expect(relationships?.[0].node.props.name).to.equal('todd');
            }),
            switchMap(({graph, relationships}) => graphGetEdge<{rank: number}>(graph, relationships[0].edgeId)),
            tap(({edge}) => {
                expect(edge?.props.rank).to.equal(5)
            })
        ))
    );
});