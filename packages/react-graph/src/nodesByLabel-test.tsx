import React, {useEffect, useRef} from "react";
import {useGraphLogin, useGraphNodesByLabel, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {switchMap, tap} from "rxjs";
import {asNodeId} from "@end-game/graph";

let accountCreated = false;

renderApp('testGraph', () => {
    const nodes = useGraphNodesByLabel('thing');
    const graphPut = useGraphPut();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass')),
            tap(() => graphPut('thing', asNodeId('thing1') , {name: 'thing1'}).subscribe()),
            tap(() => graphPut('thing', asNodeId('thing2') , {name: 'thing2'}).subscribe()),
            tap(() => graphPut('thing', asNodeId('thing3') , {name: 'thing3'}).subscribe()),
        ).subscribe();
        accountCreated = true;
    }, [])


    const count = useRef(4);

    const addThing = () => {
        graphPut('thing', asNodeId(`thing${count.current}`) , {name: 'thing' + count.current}).subscribe();
        count.current = count.current + 1;
    }

    return (
        <>
            <Username/>
            <button id="count" onClick={addThing}/>
            {nodes.map((node) => <div key={node.nodeId} id={node.nodeId}>{node.props.name}</div>)}
        </>
    )
});