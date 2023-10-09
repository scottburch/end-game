import type {Graph, GraphHandler} from "@end-game/graph";
import {of, tap} from "rxjs";
import {insertHandlerBefore} from "@end-game/rxjs-chain";


export const localStateHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => insertHandlerBefore(graph.chains.putNode, 'auth', 'local-state', authAntePutNodeHandler)),
);

const authAntePutNodeHandler: GraphHandler<'putNode'> = ({graph, node}) => {
    return /^local./.test(node.label) ? (
        of({graph, node})
    ): of({graph, node})

}
