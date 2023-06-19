import type {EdgeId, Graph, GraphEdge,  GraphNode, NodeId, RangeOpts} from "@end-game/graph";

import {from, map, of, switchMap, tap} from "rxjs";
import type {RxjsChain} from "@end-game/rxjs-chain";
import {appendHandler, chainNext, newRxjsChain, RxjsChainFn} from "@end-game/rxjs-chain";
import {startServer} from "./server.js";
import {
    getNode,
    getEdge,
    getRelationships,
    putEdge,
    putNode,
    nodesByLabel, nodesByProp, LogLevel
} from "@end-game/graph";

import ld from "lodash";

export type PeerId = string & {type: 'peerId'};

export type P2pOpts = {
    listeningPort?: number,
    peerId: PeerId
}

export const asPeerId = (peerId: string) => peerId as PeerId;

export type P2pMsg<Cmd extends string = string, Data extends Object = Object> = {
    cmd: Cmd,
    data: Data
};

export type GraphP2pHandler<T extends keyof GraphWithP2p['chains']> = RxjsChainFn<GraphWithP2p['chains'][T]['type']>


export type GraphWithP2p = Graph & {
    peerId: PeerId
    peerConnections: Set<PeerId>
    chains: Graph['chains'] & {
        peerIn: RxjsChain<{ graph: Graph, msg: P2pMsg }>
        peersOut: RxjsChain<{ graph: Graph, msg: P2pMsg }>
    }
}


// *** Stuff to output

export const p2pHandlers = (graph: Graph, opts: P2pOpts) =>
    of(graph as GraphWithP2p).pipe(
        tap(graph => graph.peerId = opts.peerId),
        tap(graph => graph.peerConnections = graph.peerConnections || new Set()),
        tap(addChainsToGraph),
        switchMap(graph => opts.listeningPort ? startServer(graph, opts.listeningPort) : of(graph)),
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
    graph.chains.peerIn = graph.chains.peerIn || newRxjsChain({logger: chainLogger('peerIn')});
    graph.chains.peersOut = graph.chains.peersOut || newRxjsChain({logger: chainLogger('peersOut')});

    function chainLogger(chainName: string) {
        return (fnName: string, v: any) =>
            chainNext(graph.chains.log, {
                graph, item: {
                    code: 'CHAIN',
                    level: LogLevel.DEBUG,
                    text: `${graph.graphId}: ${chainName} - ${fnName}, ${JSON.stringify(ld.omit(v, 'graph'))}`
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

const getNodeHandler: GraphP2pHandler<'getNode'> = ({graph, nodeId, node,opts}) => {
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

const nodesByPropHandler: GraphP2pHandler<'nodesByProp'> = ({graph, label, key, value, nodes}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'nodesByProp', data: {label, key, value}}
    }).subscribe()
    return of({graph, label, key, value, nodes});
}

const getEdgeHandler: GraphP2pHandler<'getEdge'> = ({graph, edgeId, edge, opts}) => {
    chainNext((graph as GraphWithP2p).chains.peersOut, {
        graph,
        msg: {cmd: 'getEdge', data: edgeId}
    })
    return of({graph, edgeId, edge, opts});
}


// ****** PEER IN STUFF


const peerInHandler: GraphP2pHandler<'peerIn'> = ({graph, msg}) =>
    of({graph, msg}).pipe(
        tap(({msg}) => msg.cmd === 'putNode' && doPutNodeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'putEdge' && doPutEdgeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'getNode' && doGetNodeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'getRelationships' && doGetRelationshipsIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'getEdge' && doGetEdgeIn(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'nodesByLabel' && doGetNodesByLabel(graph, msg).subscribe()),
        tap(({msg}) => msg.cmd === 'nodesByProp' && doGetNodesByProp(graph, msg).subscribe())
    )


const doPutNodeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'putNode', GraphNode>).pipe(
        switchMap(msg => putNode(graph, msg.data))
    );

const doPutEdgeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'putEdge', GraphEdge>).pipe(
        switchMap(msg =>
            putEdge(graph, msg.data)
        )
    );

const doGetNodeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'getNode', NodeId>).pipe(
        switchMap(msg => getNode(graph, msg.data, {})),
        tap(({node}) => node?.nodeId && chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: node}
        }).subscribe())
    );

const doGetRelationshipsIn = (graph: Graph, msg: P2pMsg) =>
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

const doGetNodesByLabel = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'nodesByLabel', {label: string, opts: RangeOpts}>).pipe(
        switchMap(msg => nodesByLabel(graph, msg.data.label, msg.data.opts)),
        switchMap(({nodes}) => from(nodes)),
        switchMap(node => chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: node}
        })),
    );

const doGetNodesByProp = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'nodesByProp', {label: string, key: string, value: string}>).pipe(
        switchMap(msg => nodesByProp(graph, msg.data.label, msg.data.key, msg.data.value)),
        switchMap(({nodes}) => from(nodes)),
        switchMap(node => chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: node}
        })),

    )

const doGetEdgeIn = (graph: Graph, msg: P2pMsg) =>
    of(msg as P2pMsg<'getEdge', EdgeId>).pipe(
        switchMap(msg => getEdge(graph, msg.data, {})),
        tap(({edge}) => edge?.edgeId && chainNext((graph as GraphWithP2p).chains.peersOut, {
            graph,
            msg: {cmd: 'putNode', data: edge}
        }).subscribe())
    )







