import React, {useEffect} from "react";
import {renderApp} from "./test/reactTestUtils.jsx";
import {useDialer, useGraphNodesByLabel} from "./react-graph.jsx";


renderApp('test-graph', () => {
    const dial = useDialer();
    const nodes = useGraphNodesByLabel('thing');

    useEffect(() => {
        dial({url: 'ws://localhost:11116'}).subscribe();
    }, [])


    return (
        <>
            List of things:
            {nodes.map(node=>  <div key={node.nodeId} id={node.nodeId}>{node.props.name}</div>)}
        </>
    )
});