import {default as React, useEffect} from 'react'
import {useGraphLogin, useGraphPut, useGraphPutEdge, useNewAccount} from "@end-game/react-graph";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {GraphExplorerBtn} from "./GraphExplorerBtn.jsx";
import {switchMap, of, tap} from "rxjs";
import type {NodeId} from "@end-game/graph";
import {nodeId} from "@end-game/graph";


let accountCreated = false;

renderApp('test-graph', () => {
    const graphPut = useGraphPut();
    const graphPutEdge = useGraphPutEdge();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        of(true).pipe(
            switchMap(() => accountCreated ? of(true) :  newAccount('scott', 'pass')),
            tap(() => accountCreated = true),
            switchMap(() => login('scott', 'pass')),
            switchMap(() => graphPut('person', nodeId('scott'), {name: 'scott', age: 1})),
            switchMap(() => graphPut('person', nodeId('todd'), {name: 'todd', age: 2})),
            switchMap(() => graphPutEdge('friend', 'f1', nodeId('scott'), nodeId('todd'), {since: new Date().toISOString()})),
            switchMap(() => graphPutEdge('friend', 'f2', nodeId('todd'), nodeId('scott'), {since: new Date().toISOString()})),
            switchMap(() => graphPut('country', nodeId('mexico'), {name: 'mexico'})),
            switchMap(() => graphPutEdge('lives_in', 'li1', nodeId('scott'), nodeId('mexico'), {}))
        ).subscribe()
    }, [])

    return (
        <>
            <React.StrictMode>
                <Username/>
                <GraphExplorerBtn/>
            </React.StrictMode>
        </>
    )
});



