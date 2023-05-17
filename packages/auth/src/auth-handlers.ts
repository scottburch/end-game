import type {Graph, GraphHandler, Props} from '@end-game/graph'
import {graphPutEdge} from "@end-game/graph";
import {map, of, switchMap, tap, throwError} from "rxjs";
import {insertHandlerAfter, insertHandlerBefore} from "@end-game/rxjs-chain";
import type {GraphWithUser, NodeWithSig} from "./graph-auth.js";
import {authNodeExists, isUserAuthedToWriteEdge, isUserLoggedIn, isUserNodeOwner, signGraphNode} from "./graph-auth.js";

export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutAnteHandler)),
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'auth', authPutPostHandler)),
    tap(graph => insertHandlerBefore(graph.chains.putEdge, 'storage', 'auth', authPutEdgeAnteHandler))
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {

    if(node.label === 'auth') {
        return authNodeExists(graph, node.props.username).pipe(
            switchMap(exists => exists ? throwError(() => 'USER_ALREADY_EXISTS') : of({graph, node})),
        )
    }



    return (isUserLoggedIn(graph) ? of({graph, node}) : throwError(() => 'NOT_LOGGED_IN')).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(graph, node as NodeWithSig<Props>)),
        switchMap(isOwner => isOwner ? signGraphNode(graph, node) : throwError(() => 'UNAUTHORIZED_USER')),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) =>
    (isUserLoggedIn(graph) ? of({graph, edge}) : throwError(() => 'NOT_LOGGED_IN')).pipe(
        switchMap(() => isUserAuthedToWriteEdge(graph, edge)),
        switchMap(authed => authed ? of({graph, edge}) : throwError(() => 'UNAUTHORIZED_USER'))
    );

const authPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if(node.label === 'auth') {
        return of({graph, node})
    }
    return of((graph as GraphWithUser).user?.nodeId).pipe(
        switchMap(nodeId => nodeId ? (
            graphPutEdge(graph, '', 'owned_by', node.nodeId, nodeId, {})
        ) : of(undefined)),
        map(() => ({graph, node}))
    )
};
