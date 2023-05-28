import React, {useEffect} from "react";
import {renderApp} from "./test/reactTestUtils.jsx";
import {useDialer, useGraphNodesByLabel} from "./react-graph.jsx";


renderApp(() => {
    const dial = useDialer();
    const nodes = useGraphNodesByLabel('thing');

    useEffect(() => {
        dial({url: 'ws://localhost:11115'}).subscribe();
    }, [])


    return (
        <>
            {nodes.map(node=>  <div key={node.nodeId} id={node.nodeId}>{node.props.name}</div>)}
        </>
    )
});