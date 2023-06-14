import * as React from 'react'
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {useGraphNode, useGraphLogin, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {switchMap} from "rxjs";
import type {NodeId} from "@end-game/graph";
import {asNodeId} from "@end-game/graph";



renderApp('test-graph', () => {
    const newAccount = useNewAccount();
    const login = useGraphLogin();
    const put = useGraphPut();
    const user = useGraphNode(asNodeId('scott'));

    const doLogin = () => newAccount('scott', 'pass').pipe(
        switchMap(() => login('scott', 'pass')),
        switchMap(() => put('profile', asNodeId('scott') , {name: 'scott'}))
    ).subscribe()

    return (
        <>
            <button id="login" onClick={doLogin}/>
            <div id="name">{user?.props.name}</div>
        </>
    )
});
