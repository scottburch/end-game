import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import {renderApp} from "./test/reactTestUtils.jsx";
import {useAuth, useGraphLogin, useGraphNode, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {switchMap, tap} from "rxjs";
import {asGraphId, asNodeId} from "@end-game/graph";


let accountCreated = false;

renderApp(asGraphId('test-graph'),  () => {
    const newAccount = useNewAccount();
    const auth = useAuth();
    const graphPut = useGraphPut();
    const login = useGraphLogin();
    const count = useRef<number>(0);
    const [id, setId] = useState(asNodeId(''));
    const node = useGraphNode(id)

    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass'))
        ).subscribe();
        accountCreated = true;
    }, []);

    const updateValue = () => {
        count.current = count.current + 1;
        graphPut('thing', asNodeId('thing'), new Number(count.current)).pipe(
            tap(({nodeId}) => setId(nodeId))
        ).subscribe();
    };

    return (
        <>
            <div id="username">{auth.username}</div>
            <button id="update" onClick={() => updateValue()}>Update</button>
            <div id={'output'}>{JSON.stringify(node?.props)}</div>
        </>
    )
});

