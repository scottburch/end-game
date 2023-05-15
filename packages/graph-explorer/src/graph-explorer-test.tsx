import {default as React, useEffect} from 'react'
import {useGraphLogin, useGraphPut, useGraphPutEdge, useNewAccount} from "@end-game/react-graph";
import {renderApp} from "./test/reactTestUtils.jsx";
import {GraphExplorerBtn} from "./GraphExplorerBtn.jsx";
import {concatMap, delay, of, tap} from "rxjs";

let accountCreated = false;

renderApp(() => {
    const graphPut = useGraphPut();
    const graphPutEdge = useGraphPutEdge();
    const newAccount = useNewAccount();
    const login = useGraphLogin();


    useEffect(() => {
        of(true).pipe(
            concatMap(() => accountCreated ? of(true) :  newAccount('scott', 'pass')),
            tap(() => accountCreated = true),
            concatMap(() => login('scott', 'pass')),
            concatMap(() => graphPut('person', 'scott', {name: 'scott', age: 1})),
            concatMap(() => graphPut('person', 'todd', {name: 'todd', age: 2})),
            concatMap(() => graphPutEdge('friend', 'f1', 'scott', 'todd', {since: new Date().toISOString()})),
            concatMap(() => graphPutEdge('friend', 'f2', 'todd', 'scott', {since: new Date().toISOString()})),
            concatMap(() => graphPut('country', 'mexico', {name: 'mexico'})),
            concatMap(() => graphPutEdge('lives_in', 'li1', 'scott', 'mexico', {}))
        ).subscribe()
    }, [])

    return (
        <>
            <React.StrictMode>
                <GraphExplorerBtn/>
            </React.StrictMode>
        </>
    )
});



