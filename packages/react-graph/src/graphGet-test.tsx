import React from 'react'
import {renderApp} from "./test/reactTestUtils.jsx";
import {useGraphGet, useGraphPut} from "./react-graph.jsx";

renderApp(() => {
    const node = useGraphGet('1');
    const graphPut = useGraphPut();

    return (
        <>
            <button id="count" onClick={() => graphPut('person', '1', {count: (node?.props.count || 0) + 1}).subscribe()}/>
            <div id="node-id">{node?.nodeId}</div>
            <div id="node-count">{node?.props.count}</div>
        </>
    )
});