import {graphOpen} from "../graph/graph.js";
import {handlers} from "../handlers/handlers.js";
import {
    memoryStoreGetEdgeHandler,
    memoryStoreGetNodeHandler,
    memoryStorePutEdgeHandler,
    memoryStorePutNodeHandler
} from "../handlers/store-handlers/memoryStoreHandler.js";

export const getAGraph = () =>
    graphOpen({
        graphId: 'my.graph', handlers: {
            putNode: handlers([memoryStorePutNodeHandler]),
            getNode: handlers([memoryStoreGetNodeHandler]),
            putEdge: handlers([memoryStorePutEdgeHandler]),
            getEdge: handlers([memoryStoreGetEdgeHandler])
        }
    });
