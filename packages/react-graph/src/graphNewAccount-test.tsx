import * as React from 'react'
import {renderApp} from "./test/reactTestUtils.jsx";
import {useGraphNodesByProp, useNewAccount} from "./react-graph.jsx";
import {asGraphId} from "@end-game/graph";


renderApp(asGraphId('test-graph'), () => {
    const newAccount = useNewAccount();
    const acc = useGraphNodesByProp('auth', 'username', 'scott');


    const createAccount = () => newAccount('scott', 'pass').subscribe();

    return (
        <>
            <button id="create-account" onClick={createAccount}/>
            <div id="username">{JSON.stringify(acc[0]?.props.username)}</div>
        </>
    )
});
