import type {Graph, GraphEdge, GraphHandler, GraphNode, NodeId, Props} from '@end-game/graph';
import {fromEvent, Observable, of, Subject, switchMap, tap,} from "rxjs";
import {insertHandlerAfter, insertHandlerBefore} from "@end-game/rxjs-chain";
import WebSocket from "isomorphic-ws";
import {serializer} from "@end-game/utils/serializer";

export type CloudClientOpts = {
    url: string
}

export type ClientMsg<Cmd extends string, T> = {
    cmd: Cmd,
    data: T
}

export type PutNodeClientMsg = ClientMsg<'putNode', GraphNode<Props>>
export type PutEdgeClientMsg = ClientMsg<'putEdge', GraphEdge<Props>>
export type GetNodeClientMsg = ClientMsg<'getNode', NodeId>

export type GraphWithClientQueue = Graph & {clientQueue: Subject<ClientMsg<string, any>>}


export const cloudClientHandlers = (graph: Graph, opts: CloudClientOpts) => of(graph).pipe(
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'cloud', putNodeHandler)),
    tap(graph => insertHandlerAfter(graph.chains.putEdge, 'storage', 'cloud', putEdgeHandler)),
    tap(graph => insertHandlerBefore(graph.chains.getNode, 'auth','cloud', getNodeHandler)),
    switchMap(graph => dialServer(graph, opts)),
    tap(graph => (graph as GraphWithClientQueue).clientQueue = new Subject())
);

const putNodeHandler: GraphHandler<'putNode'> = ({graph, node}) => of({graph, node}).pipe(
    tap(({graph}) => (graph as GraphWithClientQueue).clientQueue.next({cmd: 'putNode', data: node} satisfies PutNodeClientMsg))
)

const putEdgeHandler: GraphHandler<'putEdge'> = ({graph, edge}) => of({graph, edge}).pipe(
    tap(({graph}) => (graph as GraphWithClientQueue).clientQueue.next({cmd: 'putEdge', data: edge} satisfies PutEdgeClientMsg))
)

const getNodeHandler: GraphHandler<'getNode'> = ({graph, nodeId, node}) => of({graph, nodeId, node}).pipe(
    tap(({graph}) => (graph as GraphWithClientQueue).clientQueue.next({cmd: 'getNode', data: nodeId} satisfies GetNodeClientMsg)),
)

const dialServer = (graph: Graph, opts: CloudClientOpts) => new Observable<Graph>(subscriber => {
    const socketSub = of(new WebSocket(opts.url)).pipe(
        switchMap(socket => of(socket).pipe(
            switchMap(() => fromEvent(socket, 'open').pipe(
                switchMap(() => (graph as GraphWithClientQueue).clientQueue),
                tap(val => socket.send(serializer(val)))
            ))
        ))
    ).subscribe()

    subscriber.next(graph);

    return () => {
        socketSub.unsubscribe();
    }
})
