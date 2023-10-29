import * as React from 'react'
import {useEffect, useRef} from 'react'
import {renderApp} from "./test/reactTestUtils.jsx";
import {useAuth, useGraphLogin, useGraphPut, useGraphs, useNewAccount} from "./react-graph.jsx";
import {switchMap, tap} from "rxjs";
import {asGraphId, asNodeId, getNode} from "@end-game/graph";


let accountCreated = false;

renderApp(asGraphId('test-graph'),  () => {
    const auth = useAuth();
    const graphs = useGraphs()
    const graphPut = useGraphPut();
    const newAccount = useNewAccount();
    const login = useGraphLogin();
    const count = useRef<number>(0);

    useEffect(() => {
        accountCreated || newAccount('scott', 'pass').pipe(
            switchMap(() => login('scott', 'pass'))
        ).subscribe();
        accountCreated = true;
    }, []);

    const attachListener = () => {
        getNode<Number>(graphs.netGraph, asNodeId('thing'), {}).pipe(
            tap(({node}) => {
                const x = document.querySelector('#output') as Element;
                x.innerHTML = `${x.innerHTML},${node.props}`;
            })
        ).subscribe();
    }

    const updateValue = () => {
        count.current = count.current + 1;
//        putNode(graphs.netGraph, newNode(asNodeId('thing'), 'thing', new Number(count.current))).subscribe()
        graphPut('thing', asNodeId('thing'), new Number(count.current)).subscribe();
    }

    return (
        <>
            <div id="username">{auth.username}</div>
            <button id="attachListener" onClick={attachListener}>Attach Listener</button>
            <button id="update" onClick={() => updateValue()}>Update</button>
            <div id="output"/>
        </>
    )
});

