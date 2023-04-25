import {renderApp} from "@end-game/react-graph";
import React from 'react'
import {useGraph} from "@end-game/react-graph";
import type {Graph} from '@end-game/graph';
import {graphOpen} from "@end-game/graph";

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