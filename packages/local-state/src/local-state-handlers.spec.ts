import {firstValueFrom, switchMap} from "rxjs";
import {asGraphId, graphOpen, newNode, putNode} from "@end-game/graph";
import {authHandlers} from "@end-game/pwd-auth";
import {levelStoreHandlers} from "@end-game/level-store";
import {p2pHandlers} from "@end-game/p2p";
import {localStateHandlers} from "./local-state-handlers.js";


describe('local-state', () => {
    it('should not require auth to write to graph', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => putNode(graph, newNode('', 'local.mine', {mine: true}))),

        ))
    );
});


const graphWithAuth = () => graphOpen({graphId: asGraphId('my-graph')}).pipe(
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph)),
    switchMap(graph => p2pHandlers(graph)),
    switchMap(graph => localStateHandlers(graph))

);