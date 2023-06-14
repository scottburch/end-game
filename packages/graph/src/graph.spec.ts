import {
    bufferCount,
    combineLatest,
    delay,
    first,
    firstValueFrom,
    from, last,
    map,
    merge, mergeMap,
    of, range,
    scan,
    skipWhile,
    switchMap,
    tap,
    toArray
} from "rxjs";
import {
    getNode,
    getEdge,
    getRelationships,
    graphOpen,
    putNode,
    putEdge,
    nodesByProp, newNode, newGraphEdge, nodesByLabel, asNodeId, asEdgeId
} from "./graph.js";
import {expect} from "chai";
import {addThingNode, getAGraph} from "@end-game/test-utils";
import {newUid} from "./uid.js";

describe('graph', () => {
    it('should open a graph', () =>
        firstValueFrom(graphOpen({graphId: newUid()}).pipe(
            tap(graph => expect(graph).not.to.be.undefined)
        ))
    );

    describe('storing a node', () => {
        it('should put a value in a graph and assign an id', () =>
            firstValueFrom(getAGraph({graphId: newUid()}).pipe(
                switchMap(graph => putNode(graph, newNode(asNodeId(''), 'person', {name: 'scott'}))),
                tap(({graph, nodeId}) => expect(nodeId).to.have.length(12))
            ))
        );

        it('should update a value in a graph at an assigned id', () =>
            firstValueFrom(getAGraph().pipe(
                switchMap(graph => putNode(graph, newNode(asNodeId(''), 'person', {name: 'scott', foo: 1}))),
                map(({nodeId, graph}) => ({nid1: nodeId, graph, nodeId})),
                switchMap(({graph, nodeId, nid1}) => putNode(graph, newNode(nodeId, 'person', {
                    name: 'scott',
                    foo: 2
                })).pipe(
                    map(({nodeId}) => ({graph, nodeId, nid1}))
                )),
                tap(({nid1, nodeId}) => expect(nid1).to.equal(nodeId)),
                switchMap(({graph, nodeId}) => getNode(graph, nodeId, {})),
                tap(({graph, node}) => {
                    expect(node.props.name).to.equal('scott');
                    expect(node.props.foo).to.equal(2);
                })
            ))
        );
    });

    it('should get an item from the graph by id', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => putNode(graph, newNode(asNodeId(''), 'person', {name: 'scott'}))),
            switchMap(({graph, nodeId}) => getNode<{ name: string }>(graph, nodeId, {})),
            tap(({node}) => expect(node.props.name).to.equal('scott')),
            first(),
            switchMap(({graph}) => putNode(graph, newNode(asNodeId(''), 'person', {name: 'todd'}))),
            switchMap(({graph, nodeId}) => getNode<{ name: string }>(graph, nodeId, {})),
            tap(({node}) => expect(node.props.name).to.equal('todd')),
        ))
    );

    it('should be able to add a relationship between two nodes', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                putNode(graph, newNode(asNodeId('n1'), 'person', {name: 'scott'})),
                putNode(graph, newNode(asNodeId('n2'), 'person', {name: 'todd'}))
            ]).pipe(
                switchMap(arr => from(arr)),
                map(({nodeId}) => nodeId),
                toArray(),
                switchMap(([n1, n2]) => putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', n1, n2, {foo: 10}))),
                switchMap(({edge}) => getEdge(graph, edge.edgeId, {})),
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
                putNode(graph, newNode(asNodeId(`n${idx}`), 'person', {name}))
            ))),
            switchMap(([{graph}]) => combineLatest([
                of(graph),
                putEdge(graph, newGraphEdge(asEdgeId('e0'), 'friend', asNodeId('n0'), asNodeId('n1'), {rank: 5})),
                putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', asNodeId('n0'), asNodeId('n2'), {rank: 10}))
            ])),
            switchMap(([graph]) => getRelationships(graph, asNodeId('n0'), 'friend')),
            tap(({relationships}) => expect(relationships).to.deep.equal([{
                "edgeId": "e0",
                "to": "n1",
                "from": "n0"
            }, {
                "edgeId": "e1",
                "to": "n2",
                "from": "n0"
            }])),
            switchMap(({graph}) => getRelationships(graph, asNodeId('n1'), 'friend', {reverse: true})),
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
                putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', asNodeId('n1'), asNodeId('n2'), {})),
                putEdge(graph, newGraphEdge(asEdgeId('e2'), 'friend', asNodeId('n1'), asNodeId('n3'), {})),
                putEdge(graph, newGraphEdge(asEdgeId('e3'), 'owns', asNodeId('n1'), asNodeId('n4'), {})),
                putEdge(graph, newGraphEdge(asEdgeId('e4'), 'owns', asNodeId('n1'), asNodeId('n5'), {})),
            ])),
            switchMap(([{graph}]) => getRelationships(graph, asNodeId('n1') , '*')),
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
                putNode(graph, newNode(asNodeId('n1'), 'person', {name: 'scott', age: 1})),
                putNode(graph, newNode(asNodeId('n2'), 'person', {name: 'todd', age: 1})),
                putNode(graph, newNode(asNodeId('n3'), 'person', {name: 'joe', age: 2})),
            ])),
            switchMap(([{graph}]) => combineLatest([
                nodesByProp<{ name: string, age: number }>(graph, 'person', 'name', 'scott'),
                nodesByProp<{ name: string, age: number }>(graph, 'person', 'age', 1)
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
                putNode(graph, newNode('', 'person', {name: 'scott'})),
                putNode(graph, newNode('', 'person', {name: 'scooter'})),
                putNode(graph, newNode('', 'person', {name: 'sam'})),
            ])),
            switchMap(([{graph}]) => nodesByProp(graph, 'person', 'name', 'sc*')),
            tap(({nodes}) => expect(nodes).to.have.length(2)),
            switchMap(({nodes}) => from(nodes || [])),
            tap(({props}) => expect(['scooter', 'scott']).to.include(props.name)),
            bufferCount(2)
        ))
    );

    it('should update a graphGetNode() listener when node props is updated', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => putNode(graph, newNode(asNodeId('n1'), 'person', {name: 'scott'})).subscribe()),
            tap(graph => setTimeout(() => putNode(graph, newNode(asNodeId('n1'), 'person', {name: 'todd'})).subscribe(), 100)),
            switchMap(graph => getNode(graph, asNodeId('n1') , {})),
            map(({node}) => node.props.name),
            scan((names, name) => names.add(name), new Set()),
            skipWhile(names => names.size < 2),
            tap(names => expect(names.has('scott') && names.has('todd')).to.be.true)
        ))
    );

    it('should update a graphGetEdge() when the edge properties is updated', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', asNodeId('n1') , asNodeId('n2') , {foo: 10}))),
            tap(({graph}) => setTimeout(() =>
                    putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', asNodeId('n1') , asNodeId('n2') , {foo: 11})).subscribe()
                , 100)),
            switchMap(({graph}) => getEdge(graph, asEdgeId('e1'), {})),
            skipWhile(({edge}) => edge.props.foo !== 11),
        ))
    );

    it('should update a graphGetRelationships() when a relationship is added', () =>
        firstValueFrom(getAGraph().pipe(
                tap(graph => {
                    putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', asNodeId('n1') , asNodeId('n2') , {})).subscribe();
                    putEdge(graph, newGraphEdge(asEdgeId('e2'), 'friend', asNodeId('n1') , asNodeId('n3') , {})).subscribe();

                }),
                tap(graph => setTimeout(() => putEdge(graph, newGraphEdge(asEdgeId('e3'), 'friend', asNodeId('n1') , asNodeId('n4') , {})).subscribe())),
                switchMap(graph => getRelationships(graph, asNodeId('n1') , 'friend')),
                skipWhile(({relationships}) => relationships.length < 3),
            )
        ));

    it('should be able to get all relationships', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => combineLatest([
                putEdge(graph, newGraphEdge(asEdgeId('e1'), 'friend', asNodeId('n1') , asNodeId('n2') , {})),
                putEdge(graph, newGraphEdge(asEdgeId('e4'), 'friend', asNodeId('n2') , asNodeId('n1') , {})),
                putEdge(graph, newGraphEdge(asEdgeId('e2'), 'friend', asNodeId('n1') , asNodeId('n3') , {})),
                putEdge(graph, newGraphEdge(asEdgeId('e3'), 'owns', asNodeId('n1') , asNodeId('n4') , {}))
            ])),
            switchMap(([{graph}]) => getRelationships(graph, asNodeId('n1') , '*')),
            skipWhile(({relationships}) => relationships.length < 3),
        ))
    )

    it('should update nodesByProp() when a single node is added later', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => {
                setTimeout(() => putNode(graph, newNode(asNodeId('n3'), 'person', {group: 'bar'})).subscribe(), 100);
            }),
            switchMap(graph => nodesByProp(graph, 'person', 'group', 'bar')),
            skipWhile(({nodes}) => nodes.length !== 1),
        ))
    )

    it('should update nodesByProp() when a node is added', () =>
        firstValueFrom(getAGraph().pipe(
            switchMap(graph => putNode(graph, newNode(asNodeId('before1'), 'thing', {group: 'bar'}))),
            switchMap(({graph}) => putNode(graph, newNode(asNodeId('before2'), 'thing', {group: 'foo'}))),
            switchMap(({graph}) => putNode(graph, newNode(asNodeId('before3'), 'thing', {group: 'bar'}))),
            tap(({graph}) => {
                setTimeout(() => putNode(graph, newNode(asNodeId('after1'), 'car', {})).subscribe());
                setTimeout(() => putNode(graph, newNode(asNodeId('after2'), 'thing', {group: 'bar'})).subscribe());
                setTimeout(() => putNode(graph, newNode(asNodeId('after3'), 'thing', {group: 'bar'})).subscribe(), 200);
            }),
            switchMap(({graph}) => nodesByProp(graph, 'thing', 'group', 'bar')),
            skipWhile(({nodes}) => nodes.length < 4),
            tap(({nodes}) => nodes.forEach(node => expect(node.props.group).to.equal('bar')))
        ))
    );

    it('should allow multiple graphGets in parallel', () =>
        firstValueFrom(getAGraph().pipe(
            tap(graph => {
                putNode(graph, newNode(asNodeId('n1'), 'person', {name: 'p1'})).subscribe()
                putNode(graph, newNode(asNodeId('n2'), 'person', {name: 'p2'})).subscribe()
                putNode(graph, newNode(asNodeId('n3'), 'person', {name: 'p3'})).subscribe()
            }),
            delay(100),
            switchMap(graph => merge(
                getNode(graph, asNodeId('n1') , {}),
                getNode(graph, asNodeId('n2') , {}),
                getNode(graph, asNodeId('n3') , {}),
            )),
            map(({nodeId}) => nodeId),
            bufferCount(3),
            tap(x => expect(x).to.deep.equal(['n1', 'n2', 'n3']))
        ))
    );

    describe('searching', () => {
        describe('nodesByLabel', () => {
            it('should limit the number of responses', () =>
                firstValueFrom(getAGraph().pipe(
                    switchMap(graph => range(1, 5).pipe(
                        mergeMap(n => addThingNode(graph, n)),
                        last(),
                    )),
                    switchMap(({graph}) => nodesByLabel(graph, 'thing', {limit: 3})),
                    tap(({nodes}) => expect(nodes.length).to.equal(3))
                ))
            );

            it('should be able to provide gt and lt params', () =>
                firstValueFrom(getAGraph().pipe(
                    switchMap(graph => range(1, 5).pipe(
                        mergeMap(n => addThingNode(graph, n)),
                        last(),
                    )),
                    switchMap(({graph}) => nodesByLabel(graph, 'thing', {gt: 'thing1', lt: 'thing4'})),
                    tap(({nodes}) => {
                        expect(nodes.length).to.equal(2);
                        expect(nodes[0].nodeId).to.equal('thing2');
                        expect(nodes[1].nodeId).to.equal('thing3');
                    })
                ))
            );
        });
    });
});