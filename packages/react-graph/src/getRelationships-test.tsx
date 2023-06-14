import React, {useEffect, useState} from "react";
import {useGraphLogin, useGraphPutEdge, useGraphRelationships, useNewAccount} from "./react-graph.jsx";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {switchMap} from "rxjs";
import {nodeId} from "@end-game/graph";

let accountCreated = false;

renderApp('test-graph', () => {
    const rels = useGraphRelationships(nodeId('n1'), 'friend', {});
    const [count, setCount] = useState(0);
    const graphPutEdge = useGraphPutEdge();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass'))
        ).subscribe();
        accountCreated = true;
    }, [])

    const putNode = () => {
        graphPutEdge('friend', count.toString(), nodeId('n1') , nodeId(`other-${count}`) , {}).subscribe();
        setCount(count + 1);
    }

    return (
        <>
            <Username/>
            <button id="count" onClick={putNode}/>
            {rels.map((rel, idx) => <div id={`node-${idx}`}>{rel.from}-{rel.to}</div>)}
        </>
    )
});