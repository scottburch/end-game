import type {Graph} from "@end-game/graph";
import {graphError} from "@end-game/graph";

export const userAlreadyExistsError = (graph: Graph, username: string) => graphError(graph, 'USERNAME_ALREADY_EXISTS', {username});
export const notLoggedInError = (graph: Graph) => graphError(graph, 'NOT_LOGGED_IN');
export const unauthorizedUserError = (graph: Graph, username: string) => graphError(graph, 'UNAUTHORIZED_USER', {username});


