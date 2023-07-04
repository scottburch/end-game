import {addThingNode, startTestNet} from "@end-game/test-utils";
import {filter, firstValueFrom, map, of, Subscription, switchMap, tap} from "rxjs";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {getRelationships, putEdge, nodesByLabel, nodesByProp, asNodeId, asEdgeId, newEdge} from "@end-game/graph";
import {expect} from "chai";
import {dialPeer} from "./dialer.js";

describe('end-to-end testing', () => {
    it('should handle basic auth and updating across peers', () =>
        firstValueFrom(startTestNet([[2], [2], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphNewAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => graphAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => addThingNode(host0.graphs[0], 1)),
                switchMap(() => nodesByLabel(host1.graphs[0], 'thing')),
                map(({nodes}) => nodes),
                filter(nodes => !!nodes.length),
                tap(([node]) => {
                    expect(node.nodeId).to.equal('thing0001');
                    expect(node.props.name).to.equal('thing0001');
                    expect(node.nodeId).to.equal('thing0001');
                })
            ))
        ))
    );

    it('should handle sending edges between peers', () =>
        firstValueFrom(startTestNet([[2], [2], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphNewAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => graphAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => addThingNode(host0.graphs[0], 1)),
                switchMap(() => addThingNode(host0.graphs[0], 2)),
                switchMap(() => putEdge(host0.graphs[0], newEdge(asEdgeId('e1'), 'friend', asNodeId('thing1') , asNodeId('thing2') , {}))),
                switchMap(() => getRelationships(host1.graphs[0], asNodeId('thing1') , 'friend')),
                map(({relationships}) => relationships),
                filter(relationships => !!relationships.length),
                tap(relationships => expect(relationships).to.deep.equal([{
                    edgeId: 'e1',
                    to: 'thing2',
                    from: 'thing1'
                }]))
            ))
        ))
    );

    it('should lookup nodes by label across peers', () => {
        let peer0Sub: Subscription;
        let peer1Sub: Subscription;

        return firstValueFrom(startTestNet([[], [], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphNewAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => graphAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => addThingNode(host0.graphs[0], 1)),
                tap(() => setTimeout(() => {
                    peer0Sub = dialPeer(host0, {url: 'ws://localhost:11112'}).subscribe();
                    peer1Sub = dialPeer(host1, {url: 'ws://localhost:11112'}).subscribe();
                })),
                switchMap(() => nodesByLabel(host1.graphs[0], 'thing')),
                map(({nodes}) => nodes),
                filter(nodes => !!nodes.length),
                tap(([node]) => {
                    expect(node.nodeId).to.equal('thing0001');
                    expect(node.props.name).to.equal('thing0001');
                    expect(node.nodeId).to.equal('thing0001');
                    peer0Sub.unsubscribe();
                    peer1Sub.unsubscribe();
                })
            ))
        ))
    });

    it('should lookup nodes by prop across peers', () => {
        let peer0Sub: Subscription;
        let peer1Sub: Subscription;
        return firstValueFrom(startTestNet([[], [], []]).pipe(
            switchMap(({host0, host1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphAuth(host0.graphs[0], 'scott', 'pass')),
                switchMap(() => graphNewAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => graphAuth(host1.graphs[0], 'todd', 'pass')),
                switchMap(() => addThingNode(host0.graphs[0], 1)),
                tap(() => setTimeout(() => {
                    peer0Sub = dialPeer(host0, {url: 'ws://localhost:11112'}).subscribe();
                    peer1Sub = dialPeer(host1, {url: 'ws://localhost:11112'}).subscribe();
                })),
                switchMap(() => nodesByProp(host1.graphs[0], 'thing', 'name', 'thing0001')),
                map(({nodes}) => nodes),
                filter(nodes => !!nodes.length),
                tap(([node]) => {
                    expect(node.nodeId).to.equal('thing0001');
                    expect(node.props.name).to.equal('thing0001');
                    expect(node.nodeId).to.equal('thing0001');
                    peer0Sub.unsubscribe();
                    peer1Sub.unsubscribe();
                }),
            ))
        ))
    });
});