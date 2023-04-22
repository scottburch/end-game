import {graphOpen, GraphOpts} from "../graph/graph.js";
import {handlers} from "../handlers/handlers.js";
import {
    memoryStoreGetEdgeHandler,
    memoryStoreGetNodeHandler,
    memoryStoreGetRelationshipsHandler,
    memoryStoreNodesByLabelHandler, memoryStoreNodesByPropHandler,
    memoryStorePutEdgeHandler,
    memoryStorePutNodeHandler
} from "../handlers/store-handlers/memoryStoreHandler.js";
import {newUid} from "../utils/uid.js";



export const getAGraph = (opts: GraphOpts = {graphId: newUid()}) => {
    const handlerOpts = {};
    return graphOpen({
        ...opts,
        handlers: {
            putNode: handlers([memoryStorePutNodeHandler(handlerOpts)]),
            getNode: handlers([memoryStoreGetNodeHandler(handlerOpts)]),
            putEdge: handlers([memoryStorePutEdgeHandler(handlerOpts)]),
            getEdge: handlers([memoryStoreGetEdgeHandler(handlerOpts)]),
            nodesByLabel: handlers([memoryStoreNodesByLabelHandler(handlerOpts)]),
            nodesByProp: handlers([memoryStoreNodesByPropHandler(handlerOpts)]),
            getRelationships: handlers([memoryStoreGetRelationshipsHandler(handlerOpts)]),
            ...opts.handlers
        },
    });
};

