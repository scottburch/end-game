import React, {useEffect, useRef} from "react";
import {useGraphLogin, useGraphNodesByLabel, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {renderApp} from "./test/reactTestUtils.jsx";
import {switchMap} from "rxjs";

let accountCreated = false;

renderApp(() => {
    const nodes = useGraphNodesByLabel('person');
    const graphPut = useGraphPut();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass'))
        ).subscribe();
        accountCreated = true;
    }, [])


    const count = useRef(0);

    const addPerson = () => {
        graphPut('person', count.current.toString(), {name: 'scott' + count.current}).subscribe();
        count.current = count.current + 1;
    }

    return (
        <>
            <button id="count" onClick={addPerson}/>
            {nodes.map((node, idx) => <div key={node.nodeId} id={`node-${idx}`}>{node.props.name}</div>)}
        </>
    )
});