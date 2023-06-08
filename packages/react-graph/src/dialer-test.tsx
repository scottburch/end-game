import React, {useEffect} from "react";
import {renderApp} from "./test/reactTestUtils.jsx";
import {useDialer, useGraphNodesByLabel} from "./react-graph.jsx";
import {asGraphId} from "@end-game/graph";
import {asPeerId} from "@end-game/p2p";


renderApp(asGraphId('testnet'), () => {
    const dial = useDialer(asPeerId('my-peer'));
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