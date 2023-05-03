import * as React from 'react'
import {renderApp} from "./test/reactTestUtils.jsx";
import {useGraphGet, useGraphNodesByLabel, useGraphPut} from "./react-graph.jsx";
import {useRef} from "react";



renderApp(() => {
    const nodes = useGraphNodesByLabel('person');
    const graphPut = useGraphPut();
    const count = useRef(0);

    const addPerson = () => {
        graphPut('person', count.current.toString(), {name: `person-${count.current}`}).subscribe();
        count.current = count.current + 1;
    }

    return (
        <>
            <button id="count" onClick={addPerson}/>
            {nodes.map(node => <Person key={node.nodeId} nodeId={node.nodeId}/>)}
        </>
    )
});

const Person: React.FC<{nodeId: string}> = ({nodeId}) => {
    const node = useGraphGet(nodeId);
    return (
        <div id={`node-${nodeId}`}>{nodeId}:{node?.nodeId}:{node?.props.name}</div>
    )
}