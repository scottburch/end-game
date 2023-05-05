import {handlers} from "./handlers.js";
import {
    levelStoreGetEdgeHandler,
    levelStoreGetNodeHandler, levelStoreGetRelationshipsHandler,
    levelStoreNodesByLabelHandler, levelStoreNodesByPropHandler, levelStorePutEdgeHandler,
    levelStorePutNodeHandler
} from "./store-handlers/levelStoreHandler.js";
import type {Graph} from "../graph/graph.js";

export const standardHandlers = (): Graph['handlers'] => ({
    putNode: handlers([levelStorePutNodeHandler({})]),
        getNode: handlers([levelStoreGetNodeHandler({})]),
    nodesByLabel: handlers([levelStoreNodesByLabelHandler({})]),
    nodesByProp: handlers([levelStoreNodesByPropHandler({})]),
    putEdge: handlers([levelStorePutEdgeHandler({})]),
    getEdge: handlers([levelStoreGetEdgeHandler({})]),
    getRelationships: handlers([levelStoreGetRelationshipsHandler({})])
});