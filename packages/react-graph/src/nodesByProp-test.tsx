import React, {useEffect, useState} from "react";
import {useGraphLogin, useGraphNodesByProp, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {renderApp} from "./test/reactTestUtils.jsx";
import {switchMap} from "rxjs";

let accountCreated = false;

renderApp(() => {
    const nodes = useGraphNodesByProp('person', 'group', 'first');
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
        graphPut('person', count.toString(), {name: 'scott' + count, group: 'first'}).subscribe();
        setCount(count + 1);
    }

    return (
        <>
            <button id="count" onClick={putNode}/>
            {nodes.map((node, idx) => <div key={node.nodeId} id={`node-${idx}`}>{node.props.name}</div>)}
        </>
    )
});