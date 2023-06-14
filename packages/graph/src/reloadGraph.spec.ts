import {bufferCount, firstValueFrom, map, switchMap, tap} from "rxjs";
import type {NodeId} from './graph.js'
import {getEdge, getNode, getRelationships, graphOpen, nodeId, nodesByLabel, nodesByProp} from "./graph.js";
import {chainNext} from "@end-game/rxjs-chain";
import {expect} from "chai";

describe('reloadGraph chain', () => {
    it('should cause getNode to fire again', () =>
        firstValueFrom(graphOpen({graphId: 'my-graph'}).pipe(
            tap(graph => setTimeout(() => getNode(graph, nodeId('my-node') , {}).subscribe())),
            tap(graph => setTimeout(() => chainNext(graph.chains.reloadGraph, '').subscribe())),
            switchMap(graph => graph.chains.getNode),
            map(({nodeId}) => nodeId),
            bufferCount(2),
            tap(nodeIds => expect(nodeIds).to.deep.equal(['my-node', 'my-node']))
        ))
    );

    it('should cause a getEdge() to fire again', () =>
        firstValueFrom(graphOpen({graphId: 'my-graph'}).pipe(
            tap(graph => setTimeout(() => getEdge(graph, 'my-edge', {}).subscribe())),
            tap(graph => setTimeout(() => chainNext(graph.chains.reloadGraph, '').subscribe())),
            switchMap(graph => graph.chains.getEdge),
            map(({edgeId}) => edgeId),
            bufferCount(2),
            tap(nodeIds => expect(nodeIds).to.deep.equal(['my-edge', 'my-edge']))
        ))
    );

    it('should cause a nodesByLabel() to fire again', () =>
        firstValueFrom(graphOpen({graphId: 'my-graph'}).pipe(
            tap(graph => setTimeout(() => nodesByLabel(graph, 'a-label').subscribe())),
            tap(graph => setTimeout(() => chainNext(graph.chains.reloadGraph, '').subscribe())),
            switchMap(graph => graph.chains.nodesByLabel),
            map(({label}) => label),
            bufferCount(2),
            tap(labels => expect(labels).to.deep.equal(['a-label', 'a-label']))
        ))
    );

    it('should cause a getRelationships() to fire again', () =>
        firstValueFrom(graphOpen({graphId: 'my-graph'}).pipe(
            tap(graph => setTimeout(() => getRelationships(graph, nodeId('my-node') , 'my-rel').subscribe())),
            tap(graph => setTimeout(() => chainNext(graph.chains.reloadGraph, '').subscribe())),
            switchMap(graph => graph.chains.getRelationships),
            map(({rel}) => rel),
            bufferCount(2),
            tap(rels => expect(rels).to.deep.equal(['my-rel', 'my-rel']))
        ))
    );

    it('should cause a nodesByProp() to fire again', () =>
        firstValueFrom(graphOpen({graphId: 'my-graph'}).pipe(
            tap(graph => setTimeout(() => nodesByProp(graph, 'my-label', 'a-key', 'a-value').subscribe())),
            tap(graph => setTimeout(() => chainNext(graph.chains.reloadGraph, '').subscribe())),
            switchMap(graph => graph.chains.nodesByProp),
            map(({label}) => label),
            bufferCount(2),
            tap(labels => expect(labels).to.deep.equal(['my-label', 'my-label']))
        ))
    )

});