import {first, firstValueFrom, switchMap, tap} from "rxjs";
import {graphGet, graphPut, graphOpen} from "./graph.js";
import {expect} from "chai";
import {handlers} from "../handlers/handlers.js";
import {memoryStoreGetNodeHandler, memoryStorePutNodeHandler} from "../handlers/store-handlers/memoryStoreHandler.js";

describe('graph', () => {
    it('should open a graph', () =>
        firstValueFrom(graphOpen({graphId: 'my.graph'}).pipe(
            tap(graph => expect(graph).not.to.be.undefined)
        ))
    );

    it('should put a value in a graph and assign an id', () =>
        firstValueFrom(graphOpen({graphId: 'my.graph'}).pipe(
            switchMap(graph => graphPut(graph, 'person', {name: 'scott'})),
            tap(({graph, nodeId}) => expect(nodeId).to.have.length(12))
        ))
    );

    it('should get an item from the graph by id', () =>
        firstValueFrom(graphOpen({
            graphId: 'my.graph', handlers: {
                putNode: handlers([memoryStorePutNodeHandler]),
                getNode: handlers([memoryStoreGetNodeHandler])
            }
        }).pipe(
            switchMap(graph => graphPut(graph, 'person', {name: 'scott'})),
            tap(({nodeId}) => console.log(nodeId)),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, 'person', {nodeId})),
            tap(({node}) => expect(node.props.name).to.equal('scott')),
            first(),
            switchMap(({graph}) => graphPut(graph, 'person', {name: 'todd'})),
            tap(({nodeId}) => console.log(nodeId)),
            switchMap(({graph, nodeId}) => graphGet<{ name: string }>(graph, 'person', {nodeId})),
            tap(({node}) => expect(node.props.name).to.equal('todd')),
        ))
    );
});