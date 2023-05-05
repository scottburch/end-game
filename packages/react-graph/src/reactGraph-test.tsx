import * as React from 'react'
import type {Graph} from '@end-game/graph'
import {graphOpen} from "@end-game/graph";
import {useGraph} from "./react-graph.jsx";
import {renderApp} from "./test/reactTestUtils.jsx";


setTimeout(() => graphOpen({graphId: 'my-graph'}).subscribe(doRender))

const doRender = (graph: Graph) =>
    renderApp(() => {
        const graph = useGraph();

        return (
            <div id="graph-id">
                {graph.graphId}
            </div>
        )
    }, graph);