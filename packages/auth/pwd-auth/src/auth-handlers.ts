import type {Graph, GraphHandler} from '@end-game/graph'
import {first, map, of, switchMap, tap} from "rxjs";
import {insertHandlerBefore, newRxjsChain} from "@end-game/rxjs-chain";
import type {EdgeWithSig, GraphWithAuth, NodeWithAuth} from "./auth-utils.js";
import {
    asGraphWithAuth,
    findAuthNode,
    isUserAuthedToWriteEdge,
    isUserLoggedIn,
    isUserNodeOwner,
    signGraphEdge,
    signGraphNode,
    verifyEdgeSig,
    verifyNodeSig
} from "./auth-utils.js";
import {notLoggedInError, unauthorizedUserError, userAlreadyExistsError} from "./auth-errors.js";


export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutAnteHandler)),
    tap(graph => insertHandlerBefore(graph.chains.putEdge, 'storage', 'auth', authPutEdgeAnteHandler)),
    tap(graph => (asGraphWithAuth(graph)).chains.authChanged = (asGraphWithAuth(graph)).chains.authChanged || newRxjsChain())
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    if (node.label === 'auth') {
        return findAuthNode(graph, node.props.username).pipe(
            first(),
            switchMap(({node:foundNode}) => foundNode.props && foundNode.props.pub !== node.props.pub ? userAlreadyExistsError(graph, node.props.username) : of({graph, node})),
        )
    }

    // verify signature if the node has one
    if (!!(node as NodeWithAuth).sig) {
        return verifyNodeSig(graph, node as NodeWithAuth)
    }

    return (isUserLoggedIn(asGraphWithAuth(graph)) ? of({graph, node}) : notLoggedInError(graph)).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(asGraphWithAuth(graph), node as NodeWithAuth)),
        switchMap(isOwner => isOwner ? (
            of(node).pipe(
                map(node => ({...node, owner: (asGraphWithAuth(graph)).user?.nodeId})),
                switchMap(node => signGraphNode(asGraphWithAuth(graph), node))
            )
        ) : (
            unauthorizedUserError(graph, 'unknown'))
        ),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) => {
    if((edge as EdgeWithSig).sig) {
        return verifyEdgeSig(graph, edge as EdgeWithSig)
    }

    if(!isUserLoggedIn(asGraphWithAuth(graph)))  {
        return notLoggedInError(graph);
    }


    return isUserAuthedToWriteEdge(graph, edge).pipe(
        switchMap(authed => authed ? signGraphEdge(asGraphWithAuth(graph), edge) : unauthorizedUserError(graph, (graph as GraphWithAuth).user?.username || 'unknown'))
    );
}
