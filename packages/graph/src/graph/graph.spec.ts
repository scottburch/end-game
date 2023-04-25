import {bufferCount, combineLatest, delay, first, firstValueFrom, from, map, switchMap, tap, toArray} from "rxjs";
import {
    graphGet,
    graphGetEdge,
    graphGetRelationships,
    graphOpen,
    graphPut,
    graphPutEdge,
    nodesByProp
} from "./graph.ts";
import {expect} from "chai";
import {getAGraph} from "../test/testUtils.js";
import {newUid} from "../utils/uid.js";

describe('graph', () => {
    it('should open a graph', () =>
        firstValueFrom(graphOpen({graphId: newUid()}).pipe(
            tap(graph => expect(graph).not.to.be.undefined)
        ))
    );

    describe('storing a node', () => {
        it('should put a value in a graph and assign an id', () =>
            firstValueFrom(graphOpen({graphId: newUid()}).pipe(
                switchMap(graph => graphPut(graph, '', 'person', {name: 'scott'})),
                tap(({graph, nodeId}) => expect(nodeId).to.have.length(12))
            ))
        );

        it('should update a value in a graph at an assigned id', () =>
            firstValueFrom(getAGraph().pipe(
                switchMap(graph => graphPut(graph, '', 'person', {name: 'scott', foo: 1})),
                map(({nodeId, graph}) => ({nid1: nodeId, graph, nodeId})),
                switchMap(({graph, nodeId, nid1}) => graphPut(graph, nodeId, 'person', {name: 'scott', foo: 2}).pipe(
                    map(({nodeId}) => ({graph, nodeId, nid1}))
                )),
                tap(({nid1, nodeId}) => expect(nid1).to.equal(nodeId)),
                switchMap(({graph, nodeId}) => graphGet(graph, nodeId)),
                tap(({graph, node}) => {
                    expect(node.props.name).to.equal('scott');
                    expect(node.props.foo).to.equal(2);
                })
            ))
        );
    });

    it('should get an item from the graph by id', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphPut(graph, '', 'person', {name: 'scott'})),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('scott')),
            first(),
            switchMap(({graph}) => graphPut(graph, '', 'person', {name: 'todd'})),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('todd')),
        ))
    );

    it('should be able to add a relationship between two nodes', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, '', 'person', {name: 'scott'}),
                graphPut(graph, '', 'person', {name: 'todd'})
            ]).pipe(
                switchMap(arr => from(arr)),
                map(({nodeId}) => nodeId),
                toArray(),
                switchMap(([n1, n2]) => graphPutEdge(graph, 'friend', n1, n2, {foo: 10})),
                switchMap(({edge}) => graphGetEdge(graph, edge.edgeId)),
                tap(({edge}) => {
                    expect(edge?.rel).to.equal('friend');
                    expect(edge?.edgeId).to.have.length(12);
                    expect(edge?.props).to.deep.equal({foo: 10});
                    expect(edge?.from).to.have.length(12);
                    expect(edge?.to).to.have.length(12);
                    expect(edge?.from).to.not.equal(edge?.to);
                }),
            )),
        ))
    );



    it('should be able to find nodes with a given relationship', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, '', 'person', {name: 'scott'}),
                graphPut(graph, '', 'person', {name: 'todd'}),
                graphPut(graph, '', 'person', {name: 'joe'}),
            ])),
            switchMap(([{graph, nodeId: id1}, {nodeId: id2}, {nodeId: id3}]) => combineLatest([
                graphPutEdge(graph, 'friend', id1, id2, {rank: 5}),
                graphPutEdge(graph, 'friend', id1, id3, {rank: 10})
            ])),
            delay(50),
            switchMap(edges => combineLatest([
                graphGetRelationships(edges[0].graph, edges[0].edge.from, 'friend'),
                graphGetRelationships(edges[0].graph, edges[0].edge.to, 'friend', {reverse: true})
            ])),
            map(([{relationships: fromRelationships, graph}, {relationships: toRelationships}]) => ({
                graph,
                fromRelationships,
                toRelationships,
            })),
            tap(({fromRelationships, toRelationships}) => {
                expect(fromRelationships).to.have.length(2);
                expect(toRelationships).to.have.length(1);
            }),
            switchMap(({graph, fromRelationships, toRelationships}) => combineLatest([
                graphGetEdge<{ rank: number }>(graph, fromRelationships?.[0].edgeId || ''),
                graphGetEdge<{ rank: number }>(graph, fromRelationships?.[1].edgeId || ''),
                graphGetEdge<{ rank: number }>(graph, toRelationships?.[0].edgeId || ''),
            ])),
            tap(results => {
                expect(results[0].edge.props.rank + results[1].edge.props.rank).to.equal(15);
                expect(results[2].edge.props.rank).to.equal(5);
            })
        ))
    );

    it('should be able to find nodes with a given property value', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, '', 'person', {name: 'scott', age: 1}),
                graphPut(graph, '', 'person', {name: 'todd', age: 1}),
                graphPut(graph, '', 'person', {name: 'joe', age: 2}),
            ])),
            switchMap(([{graph}]) => combineLatest([
                nodesByProp(graph, 'person', 'name', 'scott'),
                nodesByProp(graph, 'person', 'age', 1)
            ])),
            tap(([{nodes: n1}, {nodes: n2}]) => {
                expect(n1).to.have.length(1);
                expect(n1?.[0].props.name).to.equal('scott');

                expect(n2).to.have.length(2);
                expect(['todd', 'scott']).to.include(n2?.[0].props.name);
                expect(['todd', 'scott']).to.include(n2?.[1].props.name);
            })
        ))
    );

    it('should be able to search for a partial property label', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPut(graph, '', 'person', {name: 'scott'}),
                graphPut(graph, '', 'person', {name: 'scooter'}),
                graphPut(graph, '', 'person', {name: 'sam'}),
            ])),
            switchMap(([{graph}]) => nodesByProp(graph, 'person', 'name', 'sc*')),
            tap(({nodes}) => expect(nodes).to.have.length(2)),
            switchMap(({nodes}) => from(nodes || [])),
            tap(({props}) => expect(['scooter','scott']).to.include(props.name)),
            bufferCount(2)
        ))
    );

    it('should update a graphGet() listener when node props is updated', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphPut(graph, '', 'person', {name: 'scott'})),
            tap(({graph, nodeId}) => setTimeout(() => graphPut(graph, nodeId, 'person', {name: 'todd'}).subscribe())),
            switchMap(({graph, nodeId}) => graphGet(graph, nodeId)),
            bufferCount(2),
            tap(([{node: n1}, {node: n2}]) => {
                expect(n1.props.name).to.equal('scott');
                expect(n2.props.name).to.equal('todd');
            }),
        ))
    );


});