import * as React from 'react'
import {useRef} from 'react'
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {useGraphNode, useGraphNodesByLabel, useGraphPut} from "./react-graph.jsx";
import type {NodeId} from "@end-game/graph";
import {asGraphId, asNodeId} from "@end-game/graph";


renderApp(asGraphId('test-graph'),  () => {
    const nodes = useGraphNodesByLabel('mem:person');
    console.log('**', nodes);
    const graphPut = useGraphPut();
    const count = useRef(0);

    const addPerson = () => {
        graphPut('mem:person', asNodeId(count.current.toString()) , {name: `person-${count.current}`}).subscribe();
        count.current = count.current + 1;
    }

    return (
        <>
            <button id="count" onClick={addPerson}>Click me</button>
            {nodes.map(node => <Person key={node.nodeId} nodeId={node.nodeId}/>)}
        </>
    )
});

const Person: React.FC<{nodeId: NodeId}> = ({nodeId}) => {
    const node = useGraphNode(nodeId, {memGraph: true});
    return (
        <div id={`node-${nodeId}`}>{nodeId}:{node?.nodeId}:{node?.props.name}</div>
    )
}