import type {EdgeId, Graph, GraphEdge, GraphNode, NodeId, RangeOpts} from "@end-game/graph";
import {
    getEdge,
    getNode,
    getRelationships,
    LogLevel,
    nodesByLabel,
    nodesByProp,
    putEdge,
    putNode
} from "@end-game/graph";

import {catchError, from, map, Observable, of, Subject, switchMap, takeUntil, tap} from "rxjs";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {appendHandler, chainNext, newRxjsChain, RxjsChainFn} from "@end-game/rxjs-chain";

import ld from "lodash";
import {P2pMsg} from "./dialer.js";

export type PeerId = string & { type: 'peerId' };

export const asPeerId = (peerId: string) => peerId as PeerId;


export type GraphP2pHandler<T extends keyof GraphWithP2p['chains']> = RxjsChainFn<GraphWithP2p['chains'][T]['type']>


export type GraphWithP2p = Graph & {
    chains: Graph['chains'] & {
        peerIn: RxjsChain<{ graph: Graph, msg: P2pMsg, peerId: PeerId }>
        peersOut: RxjsChain<{ graph: Graph, msg: P2pMsg }>
    }
}


// *** Stuff to output

export const p2pHandlers = (graph: Graph) =>
    of(graph as GraphWithP2p).pipe(
        tap(addChainsToGraph),
        tap(graph => {
            appendHandler((graph as GraphWithP2p).chains.peerIn, 'p2p', peerInHandler);
            appendHandler(graph.chains.putNode, 'p2p', putNodeHandler);
            appendHandler(graph.chains.putEdge, 'p2p', putEdgeHandler);
            appendHandler(graph.chains.getNode, 'p2p', getNodeHandler);
            appendHandler(graph.chains.getRelationships, 'p2p', getRelationshipsHandler);
            appendHandler(graph.chains.getEdge, 'p2p', getEdgeHandler);
            appendHandler(graph.chains.nodesByLabel, 'p2p', nodesByLabelHandler);
            appendHandler(graph.chains.nodesByProp, 'p2p', nodesByPropHandler);
        }),
    );


const addChainsToGraph = (graph: GraphWithP2p) => {
    graph.chains.peerIn = graph.chains.peerIn || newRxjsChain({logger: chainLogger('peerIn'), name: 'peerIn'});
    graph.chains.peersOut = graph.chains.peersOut || newRxjsChain({logger: chainLogger('peersOut'), name: 'peersOut'});

    function chainLogger(chainName: string) {
        return (module: string, v: any) =>
            chainNext(graph.chains.log, {
                graph, item: {
                    module,
                    code: 'CHAIN',
                    level: LogLevel.DEBUG,
                    data: {
                        graphId: graph.graphId,
                        chainName: chainName,
                        value: ld.omit(v, 'graph')
                    }
                }
            }).subscribe()
    }

};


const putNodeHandler: GraphP2pHandler<'putNode'> = ({graph, node}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'putNode', data: node}
    }).subscribe();
    return of({graph, node});
};

const putEdgeHandler: GraphP2pHandler<'putEdge'> = ({graph, edge}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'putEdge', data: edge}
    }).subscribe();
    return of({graph, edge});
};

const getNodeHandler: GraphP2pHandler<'getNode'> = ({graph, nodeId, node, opts}) => {
    opts.local || chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getNode', data: nodeId}
    }).subscribe();
    return of({graph, nodeId, node, opts});
};

const getRelationshipsHandler: GraphP2pHandler<'getRelationships'> = ({graph, nodeId, rel, reverse, relationships}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getRelationships', data: {nodeId, rel, reverse}}
    }).subscribe()
    return of({graph, nodeId, rel, reverse, relationships});
};

const nodesByLabelHandler: GraphP2pHandler<'nodesByLabel'> = ({graph, label, nodes, opts}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'nodesByLabel', data: {label, opts}}
    }).subscribe()
    return of({graph, label, nodes, opts})
};

const nodesByPropHandler: GraphP2pHandler<'nodesByProp'> = ({graph, label, key, value, nodes, opts}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'nodesByProp', data: {label, key, value}}
    }).subscribe()
    return of({graph, label, key, value, nodes, opts});
}

const getEdgeHandler: GraphP2pHandler<'getEdge'> = ({graph, edgeId, edge, opts}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getEdge', data: edgeId}
    })
    return of({graph, edgeId, edge, opts});
}


// ****** PEER IN STUFF


const peerInHandler: GraphP2pHandler<'peerIn'> = ({graph, msg, peerId}) =>
    of({graph, msg, peerId}).pipe(
        tap(() => msg.cmd === 'putNode' && doPutNodeIn(graph, msg, peerId).subscribe()),
        tap(() => msg.cmd === 'putEdge' && doPutEdgeIn(graph, msg, peerId).subscribe()),
        tap(() => msg.cmd === 'getNode' && doGetNodeIn(graph, msg, peerId).subscribe()),
        tap(() => msg.cmd === 'getRelationships' && doGetRelationshipsIn(graph, msg, peerId).subscribe()),
        tap(() => msg.cmd === 'getEdge' && doGetEdgeIn(graph, msg, peerId).subscribe()),
        tap(() => msg.cmd === 'nodesByLabel' && doGetNodesByLabelIn(graph, msg).subscribe()),
        tap(() => msg.cmd === 'nodesByProp' && doGetNodesByPropIn(graph, msg, peerId).subscribe())
    )


const doPutNodeIn = (graph: Graph, msg: P2pMsg, peerId: PeerId) =>
    of(msg as P2pMsg<'putNode', GraphNode>).pipe(
        switchMap(msg => putNode(graph, msg.data)),
        catchError(err => chainNext(graph.chains.log, {
                graph,
                item: {
                    module: 'p2p-handlers-put-node-in',
                    code: err.code,
                    level: LogLevel.ERROR,
                    data: err
                }
            })
        )
    );

const doPutEdgeIn = (graph: Graph, msg: P2pMsg, peerId: PeerId) =>
    of(msg as P2pMsg<'putEdge', GraphEdge>).pipe(
        switchMap(msg =>
            putEdge(graph, msg.data)
        ),
        catchError(err => chainNext(graph.chains.log, {
                graph,
                item: {
                    module: 'p2p-handlers-put-edge-in',
                    code: err.code,
                    level: LogLevel.ERROR,
                    data: err
                }
            })
        )
    );



type RegisterSubscriptionProps = {
    graph: Graph
    peerId: PeerId
    msg: P2pMsg
    subscriptionTimeoutsKey: string
    setupFn: (graph: Graph, msg: P2pMsg, timeoutSubject: Subject<number>) => Observable<undefined>
};

const subscriptionTimeouts = new Map<string, {timeout: NodeJS.Timeout, timeoutSubj: Subject<number>}>();

const registerSubscription = ({graph, peerId, msg, subscriptionTimeoutsKey, setupFn}: RegisterSubscriptionProps) => {
    let {timeout, timeoutSubj} = subscriptionTimeouts.get(subscriptionTimeoutsKey) || {timeout: undefined, timeoutSubj: undefined};

    const alreadySetup = !!timeoutSubj

    timeout && clearTimeout(timeout);
    timeoutSubj = !!timeoutSubj ? timeoutSubj :  new Subject<number>();


    timeout = setTimeout(() => {
        timeoutSubj?.next(1);
        subscriptionTimeouts.delete(subscriptionTimeoutsKey);
    }, graph.settings.subscriptionTimeout * 1000)

    subscriptionTimeouts.set(subscriptionTimeoutsKey, {timeout, timeoutSubj});

    return alreadySetup ? of(undefined) : setupFn(graph, msg, timeoutSubj);
}


const doGetNodeIn = (graph: Graph, msg: P2pMsg, peerId: PeerId) => {
    return registerSubscription({
        graph,
        peerId,
        msg,
        subscriptionTimeoutsKey: `${graph.graphId}${msg.data}${peerId}`,
        setupFn: (graph, msg, timeoutSubj) =>  of(msg as P2pMsg<'getNode', NodeId>).pipe(
            switchMap(msg => getNode(graph, msg.data, {})),
            takeUntil(timeoutSubj),
            tap(({node}) => node?.nodeId && chainNext((graph as GraphWithP2p).chains.peersOut, {
                graph,
                msg: {cmd: 'putNode', data: node}
            }).subscribe()),
            map(() => undefined)
        )
    })
};

const doGetRelationshipsIn = (graph: Graph, msg: P2pMsg, peerId: PeerId) =>
    of(msg as P2pMsg<'getRelationships', { nodeId: NodeId, rel: string, reverse: boolean, relationships: [] }>).pipe(
        switchMap(msg => getRelationships(graph, msg.data.nodeId, msg.data.rel, {reverse: msg.data.reverse}).pipe(
            map(({relationships}) => ({relationships, msg}))
        )),
        tap(({relationships, msg}) => relationships.forEach(relationship =>
            getEdge(graph, relationship.edgeId, {}).pipe(
                switchMap(({edge}) => chainNext((graph as GraphWithP2p).chains.peersOut, {
                            graph,
                            msg: {cmd: 'putEdge', data: edge}
                        }
                    )
                )
            ).subscribe()
        ))
    );

const doGetNodesByLabelIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'nodesByLabel', { label: string, opts: RangeOpts }>).pipe(
        switchMap(msg => nodesByLabel(graph, msg.data.label, msg.data.opts)),
        switchMap(({nodes}) => from(nodes)),
        switchMap(node => chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: node}
        })),
    );

const doGetNodesByPropIn = (graph: Graph, msg: P2pMsg, peerId: PeerId) =>
    of(msg as P2pMsg<'nodesByProp', { label: string, key: string, value: string }>).pipe(
        switchMap(msg => nodesByProp(graph, msg.data.label, msg.data.key, msg.data.value)),
        switchMap(({nodes}) => from(nodes)),
        switchMap(node => chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: node}
        })),
    )

const doGetEdgeIn = (graph: Graph, msg: P2pMsg, peerId: PeerId) =>
    of(msg as P2pMsg<'getEdge', EdgeId>).pipe(
        switchMap(msg => getEdge(graph, msg.data, {})),
        tap(({edge}) => edge?.edgeId && chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: edge}
        }).subscribe())
    )







