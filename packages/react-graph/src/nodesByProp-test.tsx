import React, {useEffect, useState} from "react";
import {useGraphLogin, useGraphNodesByProp, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {switchMap} from "rxjs";
import type {NodeId} from "@end-game/graph";
import {asNodeId} from "@end-game/graph";

let accountCreated = false;

renderApp('testGraph', () => {
    const nodes = useGraphNodesByProp<{group: string, name: string}>('person', 'group', 'first');
    const [count, setCount] = useState(0);
    const graphPut = useGraphPut();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass'))
        ).subscribe();
        accountCreated = true;
    }, [])


    const putNode = () => {
        graphPut('person', asNodeId(count.toString()) , {name: 'scott' + count, group: 'first'}).subscribe();
        setCount(count + 1);
    }

    return (
        <>
            <Username/>
            <button id="count" onClick={putNode}/>
            {nodes.map((node, idx) => <div key={node.nodeId} id={`node-${idx}`}>{node.props.name}</div>)}
        </>
    )
});