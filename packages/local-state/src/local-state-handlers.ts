import type {Graph} from "@end-game/graph";
import {of, tap} from "rxjs";
import {addChainFilter} from "@end-game/rxjs-chain";
import type {RxjsChain} from "@end-game/rxjs-chain"

// Don't allow auth or p2p modules unless the node label does not start with 'label.'
export const localStateHandlers = (graph: Graph) => of(graph).pipe(
    tap(graph => Object.values<RxjsChain<any>>(graph.chains).forEach(chain =>
        addChainFilter(chain, (chain, name, val) =>
            (name === 'auth' || name === 'p2p') && val?.node?.label ? of(!/local\./.test(val.node.label)) : of(true)
        )
    ))
);

