import type {Graph, GraphHandler, GraphNode, Props} from '@end-game/graph';
import {fromEvent, Observable, of, Subject, switchMap, tap,} from "rxjs";
import {insertHandlerAfter} from "@end-game/rxjs-chain";
import WebSocket from "isomorphic-ws";
import {serializer} from "@end-game/utils/serializer";

export type CloudClientOpts = {
    url: string
}

export type ClientMsg<Cmd extends string, T> = {
    cmd: 'put',
    data: T
}

export type PutClientMsg = ClientMsg<'put', GraphNode<Props>>

export type GraphWithClientQueue = Graph & {clientQueue: Subject<ClientMsg<string, any>>}


export const cloudClientHandlers = (graph: Graph, opts: CloudClientOpts) => of(graph).pipe(
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'cloud', cloudPutPostHandler)),
    switchMap(graph => dialServer(graph, opts)),
    tap(graph => (graph as GraphWithClientQueue).clientQueue = new Subject())
);

const cloudPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => of({graph, node}).pipe(
    tap(({graph}) => (graph as GraphWithClientQueue).clientQueue.next({cmd: 'put', data: node} satisfies PutClientMsg))
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
