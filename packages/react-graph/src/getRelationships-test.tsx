import React, {useEffect, useState} from "react";
import {useAuth, useGraphLogin, useGraphPutEdge, useGraphRelationships, useNewAccount} from "./react-graph.jsx";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {switchMap, tap} from "rxjs";

let accountCreated = false;

renderApp(() => {
    const rels = useGraphRelationships('n1', 'friend', {});
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
        graphPutEdge('friend', count.toString(), 'n1', `other-${count}`, {}).subscribe();
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