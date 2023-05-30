import * as React from 'react'
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {useGraphNode, useGraphLogin, useGraphNodesByLabel, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {useEffect, useRef} from "react";
import {switchMap} from "rxjs";

let accountCreated = false;


renderApp(() => {
    const nodes = useGraphNodesByLabel('person');
    const graphPut = useGraphPut();
    const count = useRef(0);
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass'))
        ).subscribe();
        accountCreated = true;
    }, [])



    const addPerson = () => {
        graphPut('person', count.current.toString(), {name: `person-${count.current}`}).subscribe();
        count.current = count.current + 1;
    }

    return (
        <>
            <Username/>
            <button id="count" onClick={addPerson}/>
            {nodes.map(node => <Person key={node.nodeId} nodeId={node.nodeId}/>)}
        </>
    )
});

const Person: React.FC<{nodeId: string}> = ({nodeId}) => {
    const node = useGraphNode(nodeId);
    return (
        <div id={`node-${nodeId}`}>{nodeId}:{node?.nodeId}:{node?.props.name}</div>
    )
}