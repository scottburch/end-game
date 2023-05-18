import * as React from 'react'
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {useGraphGet, useGraphLogin, useGraphPut, useNewAccount} from "./react-graph.jsx";
import {switchMap} from "rxjs";



renderApp(() => {
    const newAccount = useNewAccount();
    const login = useGraphLogin();
    const put = useGraphPut();
    const user = useGraphGet('scott');

    const doLogin = () => newAccount('scott', 'pass').pipe(
        switchMap(() => login('scott', 'pass')),
        switchMap(() => put('profile', 'scott', {name: 'scott'}))
    ).subscribe()

    return (
        <>
            <button id="login" onClick={doLogin}/>
            <div id="name">{user?.props.name}</div>
        </>
    )
});