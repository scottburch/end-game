import {renderApp} from "../test/reactTestUtils.tsx";
import React from 'react'
import {useGraph} from "./react-graph.tsx";
import {Graph, graphOpen} from "../../../graph/src/graph/graph.ts";

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