import {
    GraphEdge,
    GraphNode,
    graphOpen,
    graphPutEdge,
    graphPutNode,
    newGraphEdge,
    newGraphNode,
    nodesByLabel,
    Props
} from "@end-game/graph";
import {combineLatest, delay, filter, firstValueFrom, map, of, range, switchMap, tap, timer} from "rxjs";
import {GraphWithP2p, p2pHandlers} from "./p2pHandlers.js";
import {chainNext} from "@end-game/rxjs-chain";
import {expect} from "chai";
import {startTestNet} from "./test/testUtils.js";
import {graphAuth, graphNewAuth} from "@end-game/auth";

describe('p2p handlers', () => {
    it('should setup peer chains', () =>
        firstValueFrom(graphOpen().pipe(
                switchMap(graph => p2pHandlers(graph, {peerId: 'test'})),
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
        firstValueFrom(graphOpen().pipe(
            switchMap((graph) => p2pHandlers(graph, {listeningPort: 11110, peerId: 'test'})),
            tap(graph => timer(1).pipe(
                switchMap(() => graphPutNode(graph, newGraphNode('node1', 'thing', {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            tap(({msg}) => {
                expect(msg.cmd).to.equal('putNode');
                expect((msg.data as GraphNode<Props>).label).to.equal('thing')
            })
        ))
    );

    it('should put a putEdge onto the peersOut', () =>
        firstValueFrom(graphOpen().pipe(
            switchMap((graph) => p2pHandlers(graph, {listeningPort: 11110, peerId: 'test'})),
            tap(graph => timer(1).pipe(
                switchMap(() => graphPutEdge(graph, newGraphEdge('edge1', 'friend', 'node1', 'node2', {name: 'thing1'})))
            ).subscribe()),
            switchMap(graph => (graph as GraphWithP2p).chains.peersOut),
            map(({msg}) => ({msg, edge: (msg.data as GraphEdge<Props>)})),
            tap(({msg, edge}) => {
                expect(msg.cmd).to.equal('putEdge');
                expect(edge.from).to.equal('node1');
                expect(edge.to).to.equal('node2');
                expect(edge.rel).to.equal('friend');
            })
        ))
    );

    describe('full network tests', () => {
        it('should send a putNode to a remote peer', () =>
            firstValueFrom(startTestNet([[1], []]).pipe(
                switchMap(({node0, node1}) => of({node0, node1}).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphPutNode(node0, newGraphNode('thing1', 'thing', {name: 'thing1'}))),
                    ).subscribe()),

                    switchMap(() => nodesByLabel(node1, 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node1, 'thing')),
                    filter(({nodes}) => !!nodes.length),
                )),
            ))
        );

        it('should send a putNode to more than one remote peer', () =>
            firstValueFrom(startTestNet([[1,2,3,4,5], [], [], [], [], []]).pipe(
                switchMap(({node0, node1, node2, node3, node4, node5}) => of({node0, node1, node2, node3, node4, node5}).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphPutNode(node0, newGraphNode('thing1', 'thing', {name: 'thing1'}))),
                    ).subscribe()),

                    switchMap(() => nodesByLabel(node1, 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node2, 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node3, 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node4, 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node5, 'thing')),
                    filter(({nodes}) => !!nodes.length),

                )),
            ))
        );


        it('should send a putNode through a middle peer', () =>
            firstValueFrom(startTestNet([[1], [2], []]).pipe(
                switchMap(({node0, node1, node2}) => of({node0, node1, node2}).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphPutNode(node0, newGraphNode('thing1', 'thing', {name: 'thing1'})))
                    ).subscribe()),

                    switchMap(() => nodesByLabel(node1, 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node1, 'thing')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node2, 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node2, 'thing')),
                    filter(({nodes}) => !!nodes.length),
                )),
            ))
        );

        it('should handle a redundant connection', () =>
            //TODO: In the future, don't allow redundant connections - testing for now to make sure it does not blow up
            firstValueFrom(startTestNet([[1], [0]]).pipe(
                switchMap(({node0, node1, node2}) => of({node0, node1, node2}).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphPutNode(node0, newGraphNode('thing1', 'thing', {name: 'thing1'})))
                    ).subscribe()),

                    switchMap(() => nodesByLabel(node1, 'thing')),
                    filter(({nodes}) => !!nodes.length),
                ))
            ))
        );



        it('should be able to write a bunch of nodes quickly between peers', function () {
            this.timeout(15000);
            const COUNT = 20;
            return firstValueFrom(startTestNet([[1], []]).pipe(
                switchMap(({node0, node1}) => of({node0, node1}).pipe(
                    tap(() => timer(1).pipe(
                        switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                        switchMap(() => graphAuth(node0, 'scott', 'pass')),
                        tap(() => (global as any).start = Date.now()),
                        switchMap(() => range(1, COUNT).pipe(
                            switchMap(idx => graphPutNode(node0, newGraphNode(`thing${idx}`, 'thing', {name: `thing${idx}`})))
                        )),
                    ).subscribe()),

                    switchMap(() => nodesByLabel(node1, 'auth')),
                    filter(({nodes}) => !!nodes.length),

                    switchMap(() => nodesByLabel(node1, 'thing')),
                    filter(({nodes}) => nodes.length === COUNT),
                    tap(() => console.log(Date.now() - (global as any).start))
                )),
            ))
        })
    });
});
