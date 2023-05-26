import type {Props} from '@end-game/graph'
import {
    graphOpen,
    graphPutEdge,
    graphPutNode,
    newGraphEdge,
    newGraphNode
} from "@end-game/graph";
import {map, switchMap} from "rxjs";
import {authHandlers} from "../auth-handlers.js";
import {graphAuth, graphNewAuth} from "../user-auth.js";
import type {AuthNode, NodeWithSig} from "../auth-utils.js";
import {levelStoreHandlers} from "@end-game/level-store";

export const graphWithAuth = () => graphOpen().pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph))
);

export const graphWithUser = (username: string = 'scott', passwd: string = 'pass') =>
    graphWithAuth().pipe(
        switchMap(graph => graphNewAuth(graph, username, passwd)),
        switchMap(({graph}) => graphAuth(graph, username, passwd)),
        map(({graph}) => graph)
    );

export const graphWithNodeWithBadAuth = () =>
    graphOpen().pipe(
        switchMap(graph => levelStoreHandlers(graph)),
        switchMap(graph =>
            graphPutNode(graph, {
                ...newGraphNode('person', 'person', {}),
                sig: new Uint8Array(Array(64))
            } as NodeWithSig<Props> satisfies NodeWithSig<Props>)
        ),
        switchMap(({graph}) => graphPutNode(graph, {
            ...newGraphNode<AuthNode['props']>('scott', 'auth', {
                pub: '',
                enc: '',
                priv: '',
                salt: '',
                username: 'scott'
            })
        })),
        switchMap(({graph}) =>
            graphPutEdge(graph, newGraphEdge('person-scott', 'owned_by', 'person', 'scott', {}))
        ),
        switchMap(({graph}) => authHandlers(graph))
    );
