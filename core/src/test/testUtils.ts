import {graphOpen, GraphOpts} from "../graph/graph.js";
import {handlers} from "../handlers/handlers.js";
import {
    levelStoreGetEdgeHandler,
    levelStoreGetNodeHandler,
    levelStoreGetRelationshipsHandler,
    levelStoreNodesByLabelHandler, levelStoreNodesByPropHandler,
    levelStorePutEdgeHandler,
    levelStorePutNodeHandler
} from "../handlers/store-handlers/levelStoreHandler.js";
import {newUid} from "../utils/uid.js";


export const getAGraph = (opts: GraphOpts = {graphId: newUid()}) => {
    const handlerOpts = {};
    return graphOpen({
        ...opts,
        handlers: {
            putNode: handlers([levelStorePutNodeHandler(handlerOpts)]),
            getNode: handlers([levelStoreGetNodeHandler(handlerOpts)]),
            putEdge: handlers([levelStorePutEdgeHandler(handlerOpts)]),
            getEdge: handlers([levelStoreGetEdgeHandler(handlerOpts)]),
            nodesByLabel: handlers([levelStoreNodesByLabelHandler(handlerOpts)]),
            nodesByProp: handlers([levelStoreNodesByPropHandler(handlerOpts)]),
            getRelationships: handlers([levelStoreGetRelationshipsHandler(handlerOpts)]),
            ...opts.handlers
        },
    });
};

