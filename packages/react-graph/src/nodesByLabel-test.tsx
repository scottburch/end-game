import React, {useRef} from "react";
import {useGraphNodesByLabel, useGraphPut} from "./react-graph.jsx";
import {renderApp} from "./test/reactTestUtils.jsx";

renderApp(() => {
    const nodes = useGraphNodesByLabel('person');
    const graphPut = useGraphPut();

    const count = useRef(0);

    const addPerson = () => {
        graphPut('person', count.current.toString(), {name: 'scott' + count.current}).subscribe();
        count.current = count.current + 1;
    }

    return (
        <>
            <button id="count" onClick={addPerson}/>
            {nodes.map((node, idx) => <div key={node.nodeId} id={`node-${idx}`}>{node.props.name}</div>)}
        </>
    )
});