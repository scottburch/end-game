import type {Graph, GraphHandler, Props} from '@end-game/graph'
import {graphPutEdge, newGraphEdge} from "@end-game/graph";
import {first, map, of, switchMap, tap} from "rxjs";
import {insertHandlerAfter, insertHandlerBefore, newRxjsChain} from "@end-game/rxjs-chain";
import type {EdgeWithSig, GraphWithAuth, NodeWithSig} from "./auth-utils.js";
import {
    findAuthNode,
    isUserAuthedToWriteEdge,
    isUserLoggedIn,
    isUserNodeOwner, signGraphEdge,
    signGraphNode,
    verifyNodeSig
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
        return findAuthNode(graph, node.props.username).pipe(
            first(),
            switchMap(({node:foundNode}) => foundNode.props && foundNode.props.pub !== node.props.pub ? userAlreadyExistsError(graph, node.props.username) : of({graph, node})),
        )
    }

    // verify signature if the node has one
    if (!!(node as NodeWithSig<Props>).sig) {
        return verifyNodeSig(graph, node as NodeWithSig<Props>)
    }


    return (isUserLoggedIn(graph as GraphWithAuth) ? of({graph, node}) : notLoggedInError(graph)).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(graph as GraphWithAuth, node as NodeWithSig<Props>)),
        switchMap(isOwner => isOwner ? signGraphNode(graph as GraphWithAuth, node) : unauthorizedUserError(graph, 'unknown')),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) => {
    if((edge as EdgeWithSig).sig) {
        // TODO: Handle an edge with a sig here
        return of({graph, edge});
    }

    if(!isUserLoggedIn(graph as GraphWithAuth))  {
        return notLoggedInError(graph);
    }


    return isUserAuthedToWriteEdge(graph, edge).pipe(
        switchMap(authed => authed ? signGraphEdge(graph as GraphWithAuth, edge) : unauthorizedUserError(graph, (graph as GraphWithAuth).user?.username || 'unknown'))
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
