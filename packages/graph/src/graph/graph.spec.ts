import {
    bufferCount,
    combineLatest,
    delay,
    first,
    firstValueFrom,
    from,
    map,
    merge,
    of,
    scan,
    skipWhile,
    switchMap,
    tap,
    toArray
} from "rxjs";
import {
    graphGet,
    graphGetEdge,
    graphGetRelationships,
    graphOpen,
    graphPutNode,
    graphPutEdge,
    nodesByProp, newGraphNode, newGraphEdge
} from "./graph.js";
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
            firstValueFrom(getAGraph({graphId: newUid()}).pipe(
                switchMap(graph => graphPutNode(graph, newGraphNode('', 'person', {name: 'scott'}))),
                tap(({graph, nodeId}) => expect(nodeId).to.have.length(12))
            ))
        );

        it('should update a value in a graph at an assigned id', () =>
            firstValueFrom(getAGraph().pipe(
                switchMap(graph => graphPutNode(graph, newGraphNode('', 'person', {name: 'scott', foo: 1}))),
                map(({nodeId, graph}) => ({nid1: nodeId, graph, nodeId})),
                switchMap(({graph, nodeId, nid1}) => graphPutNode(graph, newGraphNode(nodeId, 'person', {name: 'scott', foo: 2})).pipe(
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
            switchMap(graph => graphPutNode(graph, newGraphNode('', 'person', {name: 'scott'}))),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('scott')),
            first(),
            switchMap(({graph}) => graphPutNode(graph, newGraphNode('', 'person', {name: 'todd'}))),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, nodeId)),
            tap(({node}) => expect(node.props.name).to.equal('todd')),
        ))
    );

    it('should be able to add a relationship between two nodes', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPutNode(graph, newGraphNode('n1', 'person', {name: 'scott'})),
                graphPutNode(graph, newGraphNode('n2', 'person', {name: 'todd'}))
            ]).pipe(
                switchMap(arr => from(arr)),
                map(({nodeId}) => nodeId),
                toArray(),
                switchMap(([n1, n2]) => graphPutEdge(graph, newGraphEdge('e1', 'friend', n1, n2, {foo: 10}))),
                switchMap(({edge}) => graphGetEdge(graph, edge.edgeId)),
                tap(({edge}) => {
                    expect(edge?.rel).to.equal('friend');
                    expect(edge?.props).to.deep.equal({foo: 10});
                    expect(edge?.from).to.equal('n1');
                    expect(edge?.to).to.equal('n2');
                }),
            )),
        ))
    );


    it('should be able to find nodes with a given relationship', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest(['scott', 'todd', 'joe'].map((name, idx) =>
                graphPutNode(graph, newGraphNode(`n${idx}`, 'person', {name}))
            ))),
            switchMap(([{graph}]) => combineLatest([
                of(graph),
                graphPutEdge(graph, newGraphEdge('e0', 'friend', 'n0', 'n1', {rank: 5})),
                graphPutEdge(graph, newGraphEdge('e1', 'friend', 'n0', 'n2', {rank: 10}))
            ])),
            switchMap(([graph]) => graphGetRelationships(graph, 'n0', 'friend')),
            tap(({relationships}) => expect(relationships).to.deep.equal([{
                "edgeId": "e0",
                "to": "n1",
                "from": "n0"
            }, {
                "edgeId": "e1",
                "to": "n2",
                "from": "n0"
            }])),
            switchMap(({graph}) => graphGetRelationships(graph, 'n1', 'friend', {reverse: true})),
            tap(({relationships}) => expect(relationships).to.deep.equal([{
                "edgeId": "e0",
                "to": "n1",
                "from": "n0"
            }])),
        ))
    );

    it('should be able to find all relationships for a given node', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPutEdge(graph, newGraphEdge('e1', 'friend', 'n1', 'n2', {})),
                graphPutEdge(graph, newGraphEdge('e2', 'friend', 'n1', 'n3', {})),
                graphPutEdge(graph, newGraphEdge('e3', 'owns', 'n1', 'n4', {})),
                graphPutEdge(graph, newGraphEdge('e4', 'owns', 'n1', 'n5', {})),
            ])),
            switchMap(([{graph}]) => graphGetRelationships(graph, 'n1', '*')),
            tap(({relationships}) => {
                expect(relationships).to.deep.equal([{
                    "edgeId": "e1",
                    "to": "n2",
                    "from": "n1"
                }, {
                    "edgeId": "e2",
                    "to": "n3",
                    "from": "n1"
                }, {
                    "edgeId": "e3",
                    "to": "n4",
                    "from": "n1"
                }, {
                    "edgeId": "e4",
                    "to": "n5",
                    "from": "n1"
                }])
            })
        ))
    );

    it('should be able to find nodes with a given property value', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPutNode(graph, newGraphNode('n1', 'person', {name: 'scott', age: 1})),
                graphPutNode(graph, newGraphNode('n2', 'person', {name: 'todd', age: 1})),
                graphPutNode(graph, newGraphNode('n3', 'person', {name: 'joe', age: 2})),
            ])),
            switchMap(([{graph}]) => combineLatest([
                nodesByProp(graph, 'person', 'name', 'scott'),
                nodesByProp(graph, 'person', 'age', 1)
            ])),
            tap(([{nodes: n1}, {nodes: n2}]) => {
                expect(n1).to.have.length(1);
                expect(n1?.[0].props.name).to.equal('scott');

                expect(n2).to.have.length(2);
                expect(n2?.[0].props.name).to.equal('scott');
                expect(n2?.[1].props.name).to.equal('todd');
            })
        ))
    );

    it('should be able to search for a partial property label', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPutNode(graph, newGraphNode('', 'person', {name: 'scott'})),
                graphPutNode(graph, newGraphNode('', 'person', {name: 'scooter'})),
                graphPutNode(graph, newGraphNode('', 'person', {name: 'sam'})),
            ])),
            switchMap(([{graph}]) => nodesByProp(graph, 'person', 'name', 'sc*')),
            tap(({nodes}) => expect(nodes).to.have.length(2)),
            switchMap(({nodes}) => from(nodes || [])),
            tap(({props}) => expect(['scooter', 'scott']).to.include(props.name)),
            bufferCount(2)
        ))
    );

    it('should update a graphGet() listener when node props is updated', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => graphPutNode(graph, newGraphNode('n1', 'person', {name: 'scott'})).subscribe()),
            tap(graph => setTimeout(() => graphPutNode(graph, newGraphNode('n1', 'person', {name: 'todd'})).subscribe(), 100)),
            switchMap(graph => graphGet(graph, 'n1')),
            map(({node}) => node.props.name),
            scan((names, name) => names.add(name), new Set()),
            skipWhile(names => names.size < 2),
            tap(names => expect(names.has('scott') && names.has('todd')).to.be.true)
        ))
    );

    it('should update a graphGetEdge() when the edge properties is updated', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphPutEdge(graph, newGraphEdge('e1', 'friend', 'n1', 'n2', {foo: 10}))),
            tap(({graph}) => setTimeout(() =>
                graphPutEdge(graph, newGraphEdge('e1', 'friend', 'n1', 'n2', {foo: 11})).subscribe()
            , 100)),
            switchMap(({graph}) => graphGetEdge(graph, 'e1')),
            skipWhile(({edge}) => edge.props.foo !== 11),
        ))
    );

    it('should update a graphGetRelationships() when a relationship is added', () =>
        firstValueFrom(getAGraph().pipe(
                tap(graph => {
                    graphPutEdge(graph, newGraphEdge('e1', 'friend', 'n1', 'n2', {})).subscribe();
                    graphPutEdge(graph, newGraphEdge('e2', 'friend', 'n1', 'n3', {})).subscribe();

                }),
                tap(graph => setTimeout(() => graphPutEdge(graph, newGraphEdge('e3', 'friend', 'n1', 'n4', {})).subscribe())),
                switchMap(graph => graphGetRelationships(graph, 'n1', 'friend')),
                skipWhile(({relationships}) => relationships.length < 3),
            )
        ));

    it('should be able to get all relationships', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                graphPutEdge(graph, newGraphEdge('e1', 'friend', 'n1', 'n2', {})),
                graphPutEdge(graph, newGraphEdge('e4', 'friend', 'n2', 'n1', {})),
                graphPutEdge(graph, newGraphEdge('e2', 'friend', 'n1', 'n3', {})),
                graphPutEdge(graph, newGraphEdge('e3', 'owns', 'n1', 'n4', {}))
            ])),
            switchMap(([{graph}]) => graphGetRelationships(graph, 'n1', '*')),
            skipWhile(({relationships}) => relationships.length < 3),
        ))
    )

    it('should update nodesByProp() when a single node is added later', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => {
                setTimeout(() => graphPutNode(graph, newGraphNode('n3', 'person', {group: 'bar'})).subscribe(), 100);
            }),
            switchMap(graph => nodesByProp(graph, 'person', 'group', 'bar')),
            skipWhile(({nodes}) => nodes.length !== 1),
        ))
    )

    it('should update nodesByProp() when a node is added', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => graphPutNode(graph, newGraphNode('n1', 'person', {group: 'foo'}))),
            tap(({graph}) => {
                setTimeout(() => graphPutNode(graph, newGraphNode('n2', 'car', {})).subscribe());
                setTimeout(() => graphPutNode(graph, newGraphNode('n3', 'person', {group: 'bar'})).subscribe());
                setTimeout(() => graphPutNode(graph, newGraphNode('n4', 'person', {group: 'bar'})).subscribe(), 200);
            }),
            switchMap(({graph}) => nodesByProp(graph, 'person', 'group', 'bar')),
            skipWhile(({nodes}) => nodes.length < 2),
        ))
    );

    it('should allow multiple graphGets in parallel', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => {
                graphPutNode(graph, newGraphNode('n1', 'person', {name: 'p1'})).subscribe()
                graphPutNode(graph, newGraphNode('n2', 'person', {name: 'p2'})).subscribe()
                graphPutNode(graph, newGraphNode('n3', 'person', {name: 'p3'})).subscribe()
            }),
            delay(100),
            switchMap(graph => merge(
                graphGet(graph, 'n1'),
                graphGet(graph, 'n2'),
                graphGet(graph, 'n3'),
            )),
            map(({nodeId}) => nodeId),
            bufferCount(3),
            tap(x => expect(x).to.deep.equal(['n1', 'n2', 'n3']))
        ))
    );
});