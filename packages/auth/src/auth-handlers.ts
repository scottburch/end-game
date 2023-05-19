import type {Graph, GraphHandler, Props} from '@end-game/graph'
import {graphPutEdge, newGraphEdge} from "@end-game/graph";
import {first, map, of, switchMap, tap} from "rxjs";
import {insertHandlerAfter, insertHandlerBefore, newRxjsChain} from "@end-game/rxjs-chain";
import type {GraphWithAuth, NodeWithSig} from "./auth-utils.js";
import {doesAuthNodeExist, isUserAuthedToWriteEdge, isUserLoggedIn, signGraphNode} from "./auth-utils.js";
import {notLoggedInError, unauthorizedUserError, userAlreadyExistsError} from "./auth-errors.js";
import {isUserNodeOwner} from "./auth-utils.js";





export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutAnteHandler)),
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'auth', authPutPostHandler)),
    tap(graph => insertHandlerBefore(graph.chains.putEdge, 'storage', 'auth', authPutEdgeAnteHandler)),

    tap(graph => (graph as GraphWithAuth).chains.authChanged = (graph as GraphWithAuth).chains.authChanged || newRxjsChain())
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if(node.label === 'auth') {
        return doesAuthNodeExist(graph, node.props.username).pipe(
            first(),
            switchMap(({exists}) => exists ? userAlreadyExistsError(node.props.username) : of({graph, node})),
        )
    }



    return (isUserLoggedIn(graph as GraphWithAuth) ? of({graph, node}) : notLoggedInError()).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(graph as GraphWithAuth, node as NodeWithSig<Props>)),
        switchMap(isOwner => isOwner ? signGraphNode(graph as GraphWithAuth, node) : unauthorizedUserError('unknown')),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) =>
    (isUserLoggedIn(graph as GraphWithAuth) ? of({graph, edge}) : notLoggedInError()).pipe(
        switchMap(() => isUserAuthedToWriteEdge(graph, edge)),
        switchMap(authed => authed ? of({graph, edge}) : unauthorizedUserError('unknown'))
    );

const authPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if(node.label === 'auth') {
        return of({graph, node})
    }
    return of((graph as GraphWithAuth).user?.nodeId).pipe(
        switchMap(nodeId => nodeId ? (
            graphPutEdge(graph, newGraphEdge('', 'owned_by', node.nodeId, nodeId, {}))
        ) : of(undefined)),
        map(() => ({graph, node}))
    )
};
