import {default as React, useEffect} from 'react'
import {useGraphLogin, useGraphPut, useGraphPutEdge, useNewAccount} from "@end-game/react-graph";
import {renderApp, Username} from "./test/reactTestUtils.jsx";
import {GraphExplorer} from "./GraphExplorer.jsx";
import {switchMap, of, tap} from "rxjs";
import {asEdgeId, asGraphId, asNodeId} from "@end-game/graph";


let accountCreated = false;

renderApp(asGraphId('test-graph'), () => {
    const graphPut = useGraphPut();
    const graphPutEdge = useGraphPutEdge();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        of(true).pipe(
            switchMap(() => accountCreated ? of(true) :  newAccount('scott', 'pass')),
            tap(() => accountCreated = true),
            switchMap(() => login('scott', 'pass')),
            switchMap(() => graphPut('person', asNodeId('scott'), {name: 'scott', age: 1})),
            switchMap(() => graphPut('person', asNodeId('todd'), {name: 'todd', age: 2})),
            switchMap(() => graphPutEdge('friend', asEdgeId('f1'), asNodeId('scott'), asNodeId('todd'), {since: new Date().toISOString()})),
            switchMap(() => graphPutEdge('friend', asEdgeId('f2'), asNodeId('todd'), asNodeId('scott'), {since: new Date().toISOString()})),
            switchMap(() => graphPut('country', asNodeId('mexico'), {name: 'mexico'})),
            switchMap(() => graphPutEdge('lives_in', asEdgeId('li1'), asNodeId('scott'), asNodeId('mexico'), {}))
        ).subscribe()
    }, [])

    return (
        <>
            <React.StrictMode>
                <Username/>
                <GraphExplorer/>
            </React.StrictMode>
        </>
    )
});



