import {graphOpen, GraphOpts} from "../graph/graph.js";
import {handlers} from "../handlers/handlers.js";
import {
    memoryStoreGetEdgeHandler,
    memoryStoreGetNodeHandler, memoryStoreGetRelatedNodes, memoryStoreNodesByLabelHandler,
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
            getRelatedNodes: handlers([memoryStoreGetRelatedNodes]),
            ...opts.handlers
        },
    });
