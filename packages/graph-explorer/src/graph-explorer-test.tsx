import {default as React} from 'react'
import {useGraphGet} from "@end-game/react-graph";
import {renderApp} from "@end-game/react-graph/reactTestUtils";
import type {Graph} from '@end-game/graph'
import {graphOpen, standardHandlers} from '@end-game/graph'
import {tap} from "rxjs";


const doRender = (graph: Graph) =>
    renderApp((graph) => {
        const node = useGraphGet('1');
//    const graphPut = useGraphPut();

        return (
            <>
                hello
                {/*<button id="count" onClick={() => graphPut('person', '1', {count: (node?.props.count || 0) + 1}).subscribe()}/>*/}
                {/*<div id="node-id">{node?.nodeId}</div>*/}
                {/*<div id="node-count">{node?.props.count}</div>*/}
            </>
        )
    });


graphOpen({
    graphId: 'a-graph',
    handlers: standardHandlers()
}).pipe(
    tap(() => console.log(doRender)),
    tap(graph => doRender(graph))
).subscribe();

