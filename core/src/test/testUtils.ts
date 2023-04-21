import {graphOpen, GraphOpts} from "../graph/graph.js";
import {handlers} from "../handlers/handlers.js";
import {
    memoryStoreGetEdgeHandler,
    memoryStoreGetNodeHandler, memoryStoreGetRelationships, memoryStoreNodesByLabelHandler,
    memoryStorePutEdgeHandler,
    memoryStorePutNodeHandler
} from "../handlers/store-handlers/memoryStoreHandler.js";


export const getAGraph = (opts: GraphOpts = {}) =>
    graphOpen({
        graphId: 'my.graph',
        ...opts,
        handlers: {
            putNode: handlers([memoryStorePutNodeHandler]),
            getNode: handlers([memoryStoreGetNodeHandler]),
            putEdge: handlers([memoryStorePutEdgeHandler]),
            getEdge: handlers([memoryStoreGetEdgeHandler]),
            nodesByLabel: handlers([memoryStoreNodesByLabelHandler]),
            getRelationships: handlers([memoryStoreGetRelationships]),
            ...opts.handlers
        },
    });
