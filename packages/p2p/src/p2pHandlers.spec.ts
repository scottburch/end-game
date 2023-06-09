import {
    Graph,
    GraphEdge, getEdge, getNode,
    GraphNode,
    graphOpen,
    putEdge,
    putNode,
    newGraphEdge,
    newNode,
    nodesByLabel, asNodeId, asEdgeId, asGraphId
} from "@end-game/graph";
import {
    bufferCount,
    combineLatest,
    delay,
    filter, first,
    firstValueFrom, last,
    map, merge,
    mergeMap,
    of,
    range, skipWhile,
    switchMap, take,
    tap, timeout,
    timer, toArray
} from "rxjs";
import {GraphWithP2p, p2pHandlers} from "./p2pHandlers.js";
import {chainNext} from "@end-game/rxjs-chain";
import {expect} from "chai";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {addThingNode, startTestNet, startTestNode} from "@end-game/test-utils";
import {serializer} from "@end-game/utils/serializer";

describe('p2p handlers', () => {
    it('should setup peer chains', () =>
        firstValueFrom(graphOpen({graphId: asGraphId('my-graph')}).pipe(
                switchMap(graph => p2pHandlers(graph)),
                map(graph => graph as GraphWithP2p),
                tap(graph => timer(1).pipe(
                    switchMap(() => chainNext(graph.chains.peerIn, {graph, msg: {cmd: 'peer-in', data: {}}})),
                    switchMap(() => chainNext(graph.chains.peersOut, {graph, msg: {cmd: 'peers-out', data: {}}})),
                ).subscribe()),
                switchMap(graph => combineLatest([
                    graph.chains.peerIn,
                    graph.chains.peersOut
                ])),
                tap(([{msg: peerIn}, {msg: peersOut}]) => {
                    expect(peerIn.cmd).to.equal('peer-in');
                    expect(peersOut.cmd).to.equal('peers-out');
                })
            )
        ));

    it('should put a putNode onto the peersOut', () =>
        firstValueFrom(graphOpen({graphId: asGraphId('my-graph')}).pipe(
            switchMap((graph) => p2pHandlers(graph)),
            tap(graph => timer(1).pipe(
                switchMap(() => putNode(graph, newNode(asNodeId('node1'), 'thing', {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            tap(({msg}) => {
                expect(msg.cmd).to.equal('putNode');
                expect((msg.data as GraphNode).label).to.equal('thing')
            })
        ))
    );

    it('should put a putEdge onto the peersOut', () =>
        firstValueFrom(graphOpen({graphId: asGraphId('my-graph')}).pipe(
            switchMap((graph) => p2pHandlers(graph)),
            tap(graph => timer(1).pipe(
                switchMap(() => putEdge(graph, newGraphEdge(asEdgeId('edge1'), 'friend', asNodeId('node1') , asNodeId('node2') , {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            map(({msg}) => ({msg, edge: (msg.data as GraphEdge)})),
            tap(({msg, edge}) => {
                expect(msg.cmd).to.equal('putEdge');
                expect(edge.from).to.equal('node1');
                expect(edge.to).to.equal('node2');
                expect(edge.rel).to.equal('friend');
            })
        ))
    );

    it('should ignore getNode if the local flag is set', () =>
        firstValueFrom(graphOpen({graphId: asGraphId('my-graph')}).pipe(
            switchMap((graph) => p2pHandlers(graph)),
            tap(graph => (graph as GraphWithP2p).chains.peersOut.pipe(
                tap(({msg}) => {
                    throw(`should not receive a peersOut - received:\n${serializer(msg)}`)
                })
            ).subscribe()),
            switchMap(graph => getNode<{}>(graph, asNodeId('something') , {local: true})),
            timeout({first: 200, with: () => of(undefined)})
        ))
    );

    it('should ignore getEdge if the local flag is set', () =>
        firstValueFrom(graphOpen({graphId: asGraphId('my-graph')}).pipe(
            switchMap((graph) => p2pHandlers(graph)),
            tap(graph => (graph as GraphWithP2p).chains.peersOut.pipe(
                tap(({msg}) => {
                    throw(`should not receive a peersOut - received:\n${serializer(msg)}`)
                })
            ).subscribe()),
            switchMap(graph => getEdge(graph, asEdgeId('something'), {})),
            timeout({first: 200, with: () => of(undefined)})
        ))
    );

    describe('full network tests', () => {
        it('should send a putNode to a remote peer', () =>
            firstValueFrom(startTestNet([[1], []]).pipe(
                switchMap(({host0, host1}) => of(undefined).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => putNode(host0.graphs[0], newNode(asNodeId('thing1'), 'thing', {name: 'thing1'}))),
                    ).subscribe()),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),
                )),
            ))
        );

        it('should send a putNode to more than one remote peer', () =>
            firstValueFrom(startTestNet([[1, 2, 3, 4, 5], [], [], [], [], []]).pipe(
                switchMap(({host0, host1, host2, host3, host4, host5}) => of(undefined).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => putNode(host0.graphs[0], newNode(asNodeId('thing1'), 'thing', {name: 'thing1'}))),
                    ).subscribe()),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host2.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host3.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host4.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host5.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),
                )),
            ))
        );


        it('should send a putNode through a middle peer', () =>
            firstValueFrom(startTestNet([[1], [2], []]).pipe(
                switchMap(({host0, host1, host2}) => of(undefined).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => putNode(host0.graphs[0], newNode(asNodeId('thing1'), 'thing', {name: 'thing1'})))
                    ).subscribe()),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host2.graphs[0], 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host2.graphs[0], 'thing')),
                    filter(({nodes}) => !!nodes.length),
                )),
            ))
        );

        it('should be able to write a bunch of nodes quickly between peers', function () {
            this.timeout(15000);
            const COUNT = 20;
            return firstValueFrom(startTestNet([[1], []]).pipe(
                switchMap(({host0, host1}) => of(undefined).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                        switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                        tap(() => (global as any).start = Date.now()),
                        switchMap(() => range(1, COUNT).pipe(
                            mergeMap(idx => putNode(host0.graphs[0], newNode(asNodeId(`thing${idx}`), 'thing', {name: `thing${idx}`})))
                        )),
                    ).subscribe()),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(host1.graphs[0], 'thing')),
                    filter(({nodes}) => nodes.length === COUNT),
                    tap(() => console.log(Date.now() - (global as any).start))
                )),
            ))
        });

        it('should get a node from a peer', () =>
            firstValueFrom(startTestNode(0).pipe(
                switchMap(({host}) => graphNewAuth(host.graphs[0], 'scott', 'pass')),
                switchMap(({graph}) => graphAuth(graph, 'scott', 'pass')),
                tap(({graph}) => putNode(graph, newNode(asNodeId('thing1'), 'thing', {name: 'thing1'})).subscribe()),
                switchMap(({graph: node0}) => startTestNode(1, [0]).pipe(
                    map(({host}) => ({node0, node1: host.graphs[0]}))
                )),
                delay(1000),
                switchMap(({node0, node1}) => getNode(node1, asNodeId('thing1') , {})),
                filter(({node}) => !!node?.nodeId),
                tap(({node}) => expect(node.props.name).to.equal('thing1')),
            ))
        );

    });

    describe('searching', () => {
        describe('nodesByLabel', () => {
            it('should search for nodes by label', () => {
                return firstValueFrom(startTestNode(0).pipe(
                    switchMap(({host}) => of(undefined).pipe(
                        switchMap(() => graphNewAuth(host.graphs[0], 'scott', 'pass')),
                        switchMap(() => graphAuth(host.graphs[0], 'scott', 'pass')),
                        switchMap(() => range(1, 5).pipe(
                            mergeMap(n => addThingNode(host.graphs[0], n)),
                            last()
                        )),
                        switchMap(() => startTestNode(1, [0])),
                        switchMap(({host}) => merge(
                            testNodeReceived(host.graphs[0]),
                            testOnlyRequestedNodesSent(host.graphs[0])
                        )),
                        bufferCount(2)
                    ))
                ));

                function testNodeReceived(graph: Graph) {
                    return nodesByLabel(graph, 'thing', {gt: 'thing0001', lt: 'thing0004'}).pipe(
                        skipWhile(({nodes}) => nodes.length < 2),
                        tap(({nodes}) => {
                            expect(nodes).to.have.length(2);
                            expect(nodes[0].nodeId).to.equal('thing0002');
                            expect(nodes[1].nodeId).to.equal('thing0003');
                        }),
                        first()
                    )
                }

                function testOnlyRequestedNodesSent(graph: Graph) {
                    return (graph as GraphWithP2p).chains.peerIn.pipe(
                        filter(({msg}) => msg.cmd === 'putNode'),
                        map(({msg}) => (msg.data as any).nodeId),
                        take(2),
                        toArray(),
                        tap(nodeIds => {
                            expect(nodeIds).to.deep.equal(['thing0002', 'thing0003']);
                        })
                    )
                }
            });
        });
    });
});
