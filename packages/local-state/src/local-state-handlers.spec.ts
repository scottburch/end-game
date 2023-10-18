import {catchError, firstValueFrom, of, switchMap, tap} from "rxjs";
import {asGraphId, getNode, graphOpen, newNode, putNode} from "@end-game/graph";
import {authHandlers} from "@end-game/pwd-auth";
import {levelStoreHandlers} from "@end-game/level-store";
import {p2pHandlers} from "@end-game/p2p";
import {localStateHandlers} from "./local-state-handlers.js";
import {expect} from 'chai'


describe('local-state', () => {
    it('should not require auth to write to graph', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => putNode(graph, newNode('', 'local:mine', {mine: true}))),
            switchMap(({graph, nodeId}) => getNode(graph, nodeId, {})),
            tap(({node}) => expect(node.props.mine).to.be.true)
        ))
    );

    it('should require auth if the local prefix is not included', () =>
        firstValueFrom(graphWithAuth().pipe(
            switchMap(graph => putNode(graph, newNode('', 'mine', {}))),
            catchError(err => of(err.code)),
            tap(code => expect(code).to.equal('NOT_LOGGED_IN'))
        ))
    );
});


const graphWithAuth = () => graphOpen({graphId: asGraphId('my-graph')}).pipe(
    switchMap(graph => localStateHandlers(graph)),
    switchMap(graph => levelStoreHandlers(graph)),
    switchMap(graph => authHandlers(graph)),
    switchMap(graph => p2pHandlers(graph)),
);