import {addThingNode, startTestNet} from "@end-game/test-utils";
import {filter, firstValueFrom, map, of, Subscription, switchMap, tap} from "rxjs";
import {graphAuth, graphNewAuth} from "@end-game/pwd-auth";
import {graphGetRelationships, graphPutEdge, newGraphEdge, nodesByLabel, nodesByProp} from "@end-game/graph";
import {expect} from "chai";
import {dialPeer} from "./dialer.js";

describe('end-to-end testing', () => {
    it('should handle basic auth and updating across peers', () =>
        firstValueFrom(startTestNet([[2], [2], []]).pipe(
            switchMap(({node0, node1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => graphNewAuth(node1, 'todd', 'pass')),
                switchMap(() => graphAuth(node1, 'todd', 'pass')),
                switchMap(() => addThingNode(node0, 1)),
                switchMap(() => nodesByLabel(node1, 'thing')),
                map(({nodes}) => nodes),
                filter(nodes => !!nodes.length),
                tap(([node]) => {
                    expect(node.nodeId).to.equal('thing1');
                    expect(node.props.name).to.equal('thing1');
                    expect(node.nodeId).to.equal('thing1');
                })
            ))
        ))
    );

    it('should handle sending edges between peers', () =>
        firstValueFrom(startTestNet([[2], [2], []]).pipe(
            switchMap(({node0, node1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => graphNewAuth(node1, 'todd', 'pass')),
                switchMap(() => graphAuth(node1, 'todd', 'pass')),
                switchMap(() => addThingNode(node0, 1)),
                switchMap(() => addThingNode(node0, 2)),
                switchMap(() => graphPutEdge(node0, newGraphEdge('e1', 'friend', 'thing1', 'thing2', {}))),
                switchMap(() => graphGetRelationships(node1, 'thing1', 'friend')),
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
            switchMap(({node0, node1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => graphNewAuth(node1, 'todd', 'pass')),
                switchMap(() => graphAuth(node1, 'todd', 'pass')),
                switchMap(() => addThingNode(node0, 1)),
                tap(() => setTimeout(() => {
                    peer0Sub = dialPeer(node0, {url: 'ws://localhost:11112'}).subscribe();
                    peer1Sub = dialPeer(node1, {url: 'ws://localhost:11112'}).subscribe();
                })),
                switchMap(() => nodesByLabel(node1, 'thing')),
                map(({nodes}) => nodes),
                filter(nodes => !!nodes.length),
                tap(([node]) => {
                    expect(node.nodeId).to.equal('thing1');
                    expect(node.props.name).to.equal('thing1');
                    expect(node.nodeId).to.equal('thing1');
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
            switchMap(({node0, node1}) => of(undefined).pipe(
                switchMap(() => graphNewAuth(node0, 'scott', 'pass')),
                switchMap(() => graphAuth(node0, 'scott', 'pass')),
                switchMap(() => graphNewAuth(node1, 'todd', 'pass')),
                switchMap(() => graphAuth(node1, 'todd', 'pass')),
                switchMap(() => addThingNode(node0, 1)),
                tap(() => setTimeout(() => {
                    peer0Sub = dialPeer(node0, {url: 'ws://localhost:11112'}).subscribe();
                    peer1Sub = dialPeer(node1, {url: 'ws://localhost:11112'}).subscribe();
                })),
                switchMap(() => nodesByProp(node1, 'thing', 'name', 'thing1')),
                map(({nodes}) => nodes),
                filter(nodes => !!nodes.length),
                tap(([node]) => {
                    expect(node.nodeId).to.equal('thing1');
                    expect(node.props.name).to.equal('thing1');
                    expect(node.nodeId).to.equal('thing1');
                    peer0Sub.unsubscribe();
                    peer1Sub.unsubscribe();
                }),
            ))
        ))
    });
});