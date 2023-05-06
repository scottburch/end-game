import * as React from 'react'
import {renderApp} from "./test/reactTestUtils.jsx";
import {useGraphGet, useGraphNodesByLabel, useGraphPut} from "./react-graph.jsx";
import {useState} from "react";

renderApp(() => {
    const nodes = useGraphNodesByLabel('person');

    const graphPut = useGraphPut();

    const addPerson = () => {
        graphPut('person', (nodes.length + 1).toString(), {name: `person-${nodes.length + 1}`}).subscribe();
    }

    return (
        <>
            <button id="count" onClick={addPerson}/>
            {nodes.map(node => <Person nodeId={node.nodeId}/>)}
        </>
    )
});

const Person: React.FC<{nodeId: string}> = ({nodeId}) => {
    const node = useGraphGet(nodeId);
    return (
        <div id={`node-${nodeId}`}>{nodeId}:{node?.nodeId}:{node?.props.name}</div>
    )
}