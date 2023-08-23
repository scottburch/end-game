import React, {useEffect, useRef} from "react";
import {useDialer, useGraphLogin, useGraphNodesByLabel, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {switchMap} from "rxjs";
import {asGraphId, asNodeId, newUid} from "@end-game/graph";


let accountCreated = false;

renderApp(asGraphId('testGraph'), () => {
    const nodes = useGraphNodesByLabel('thing');
    const graphPut = useGraphPut();
    const newAccount = useNewAccount();
    const login = useGraphLogin();
    const dial = useDialer(newUid());


    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass')),
        ).subscribe();
        accountCreated = true;
    }, [])

    const count = useRef(1);

    const addThing = () => {
        graphPut('thing', asNodeId(`thing${count.current}`) , {name: 'thing' + count.current}).subscribe();
        count.current = count.current + 1;
    }

    const connect = (n: number) => () => {
        dial({
            url: `ws://localhost:${11117 + n}`,
            redialInterval: 1
        }).subscribe()
    }

    return (
        <>
            <Username/>
            <button id="count" onClick={addThing}>count</button>
            <button id="connect0" onClick={connect(0)}>connect0</button>
            <button id="connect1" onClick={connect(1)}>connect1</button>
            {nodes.map((node) => <div key={node.nodeId} id={node.nodeId}>{node.props.name}</div>)}
        </>
    )
});