import type {Graph, GraphHandler, Props} from '@end-game/graph'
import {graphPutEdge, newGraphEdge} from "@end-game/graph";
import {first, map, of, switchMap, tap} from "rxjs";
import {insertHandlerAfter, insertHandlerBefore, newRxjsChain} from "@end-game/rxjs-chain";
import type {AuthNode, GraphWithAuth, NodeWithSig} from "./auth-utils.js";
import {
    doesAuthNodeExist,
    graphGetOwnerNode,
    isUserAuthedToWriteEdge,
    isUserLoggedIn,
    isUserNodeOwner,
    signGraphNode,
    verifyNodeSigWithAuthNode
} from "./auth-utils.js";
import {notLoggedInError, unauthorizedUserError, userAlreadyExistsError} from "./auth-errors.js";


export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutAnteHandler)),
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'auth', authPutPostHandler)),
    tap(graph => insertHandlerBefore(graph.chains.putEdge, 'storage', 'auth', authPutEdgeAnteHandler)),

    tap(graph => (graph as GraphWithAuth).chains.authChanged = (graph as GraphWithAuth).chains.authChanged || newRxjsChain())
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if (node.label === 'auth') {
        return doesAuthNodeExist(graph, node.props.username).pipe(
            first(),
            switchMap(({exists}) => exists ? userAlreadyExistsError(node.props.username) : of({graph, node})),
        )
    }

    // verify signature if the node has one
    if (!!(node as NodeWithSig<Props>).sig) {
        return graphGetOwnerNode(graph, node.nodeId).pipe(
            switchMap(({node: authNode}) =>
                verifyNodeSigWithAuthNode(node as NodeWithSig<Props>, authNode as AuthNode)
            ),
            map(() => ({graph, node}))
        )
    }


    return (isUserLoggedIn(graph as GraphWithAuth) ? of({graph, node}) : notLoggedInError()).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(graph as GraphWithAuth, node as NodeWithSig<Props>)),
        switchMap(isOwner => isOwner ? signGraphNode(graph as GraphWithAuth, node) : unauthorizedUserError('unknown')),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) => {
    return isUserAuthedToWriteEdge(graph, edge).pipe(
        switchMap(authed => authed ? of({graph, edge}) : unauthorizedUserError('unknown'))
    );
}

const authPutPostHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if (node.label === 'auth') {
        return of({graph, node})
    }
    return of((graph as GraphWithAuth).user?.nodeId).pipe(
        switchMap(nodeId => nodeId ? (
            graphPutEdge(graph, newGraphEdge('', 'owned_by', node.nodeId, nodeId, {}))
        ) : of(undefined)),
        map(() => ({graph, node}))
    )
};
