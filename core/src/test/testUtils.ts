import {graphOpen, GraphOpts} from "../graph/graph.js";
import {handlers} from "../handlers/handlers.js";
import {
    LevelHandlerOpts,
    levelStoreGetEdgeHandler,
    levelStoreGetNodeHandler,
    levelStoreGetRelationshipsHandler,
    levelStoreNodesByLabelHandler, levelStoreNodesByPropHandler,
    levelStorePutEdgeHandler,
    levelStorePutNodeHandler
} from "../handlers/store-handlers/levelStoreHandler.js";
import {newUid} from "../utils/uid.js";
import {map, of, switchMap} from "rxjs";
import {rm} from "fs/promises";



export const getAGraph = (opts: GraphOpts = {graphId: newUid()}) => {
    const handlerOpts = {dir: 'xxx'};
    return deleteDbFiles(handlerOpts).pipe(
        switchMap(() => graphOpen({
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
        }))
    )

    function deleteDbFiles(handlerOpts: LevelHandlerOpts) {
        return handlerOpts.dir ?
        of(`${process.cwd()}/${handlerOpts.dir}`).pipe(
            switchMap(path => rm(path, {recursive: true, force: true})),
            map(() => true)
        ) : of(true)

    }
};

