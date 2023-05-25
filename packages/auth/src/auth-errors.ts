import {throwError} from "rxjs";
import type {Graph} from "@end-game/graph";

const error = <Code extends string, T extends Object>(graph: Graph, code: Code, data?: T) => throwError(() => ({graphId: graph.graphId, code, ...(data || {})}));
export const userAlreadyExistsError = (graph: Graph, username: string) => error(graph, 'USERNAME_ALREADY_EXISTS', {username});
export const notLoggedInError = (graph: Graph) => error(graph, 'NOT_LOGGED_IN');
export const unauthorizedUserError = (graph: Graph, username: string) => error(graph, 'UNAUTHORIZED_USER', {username});


