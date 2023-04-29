import type { HandlerFn } from "../../graph/graph.js";
export type LevelHandlerOpts = {
    dir?: string;
};
export declare const levelStoreGetNodeHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'getNode'>;
export declare const levelStorePutNodeHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'putNode'>;
export declare const levelStorePutEdgeHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'putEdge'>;
export declare const levelStoreGetEdgeHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'getEdge'>;
export declare const levelStoreNodesByLabelHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'nodesByLabel'>;
export declare const levelStoreNodesByPropHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'nodesByProp'>;
export declare const levelStoreGetRelationshipsHandler: (handlerOpts: LevelHandlerOpts) => HandlerFn<'getRelationships'>;
//# sourceMappingURL=levelStoreHandler.d.ts.map