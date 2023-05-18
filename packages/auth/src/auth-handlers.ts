import type {Graph, GraphHandler, Props} from '@end-game/graph'
import {graphPutEdge} from "@end-game/graph";
import {map, of, switchMap, tap, throwError} from "rxjs";
import {insertHandlerAfter, insertHandlerBefore, newRxjsChain} from "@end-game/rxjs-chain";
import type {GraphWithUser, NodeWithSig} from "./auth-utils.js";
import {doesAuthNodeExist, isUserAuthedToWriteEdge, isUserLoggedIn, isUserNodeOwner, signGraphNode} from "./auth-utils.js";

const error = <Code extends string, T extends Object>(code: Code, data?: T) => throwError(() => ({code, ...(data || {})}));
const userAlreadyExistsError = (username: string) => error('USERNAME_ALREADY_EXISTS', {username});
const notLoggedInError = () => error('NOT_LOGGED_IN');
const unauthorizedUserError = (username: string) => error('UNAUTHORIZED_USER', {username});




export const authHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'storage', 'auth', authPutAnteHandler)),
    tap(graph => insertHandlerAfter(graph.chains.putNode, 'storage', 'auth', authPutPostHandler)),
    tap(graph => insertHandlerBefore(graph.chains.putEdge, 'storage', 'auth', authPutEdgeAnteHandler)),

    tap(graph => (graph as GraphWithUser).chains.authChanged = (graph as GraphWithUser).chains.authChanged || newRxjsChain())
);

const authPutAnteHandler: GraphHandler<'putNode'> = ({graph, node}) => {

    if(node.label === 'auth') {
        return doesAuthNodeExist(graph, node.props.username).pipe(
            switchMap(({exists}) => exists ? userAlreadyExistsError(node.props.username) : of({graph, node})),
        )
    }



    return (isUserLoggedIn(graph as GraphWithUser) ? of({graph, node}) : notLoggedInError()).pipe(
        switchMap(({graph, node}) => isUserNodeOwner(graph as GraphWithUser, node as NodeWithSig<Props>)),
        switchMap(isOwner => isOwner ? signGraphNode(graph as GraphWithUser, node) : unauthorizedUserError('unknown')),
    )
};

const authPutEdgeAnteHandler: GraphHandler<'putEdge'> = ({graph, edge}) =>
    (isUserLoggedIn(graph as GraphWithUser) ? of({graph, edge}) : notLoggedInError()).pipe(
        switchMap(() => isUserAuthedToWriteEdge(graph, edge)),
        switchMap(authed => authed ? of({graph, edge}) : unauthorizedUserError('unknown'))
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
