import type { Handler, HandlerProps, HandlerFn } from "../graph/graph.js";
export declare const handlers: <T extends "putNode" | "getNode" | "putEdge" | "getEdge" | "nodesByLabel" | "nodesByProp" | "getRelationships">(fns: HandlerFn<T>[]) => Handler<HandlerProps<T>>;
export declare const nullHandler: <T extends "putNode" | "getNode" | "putEdge" | "getEdge" | "nodesByLabel" | "nodesByProp" | "getRelationships">() => Handler<HandlerProps<T>>;
//# sourceMappingURL=handlers.d.ts.map