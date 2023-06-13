import type {Graph} from "./graph.js";
import {throwError} from "rxjs";

export const graphError = <Code extends string, T extends Object>(graph: Graph, code: Code, data?: T) => throwError(() => ({graphId: graph.graphId, code, ...(data || {})}));
