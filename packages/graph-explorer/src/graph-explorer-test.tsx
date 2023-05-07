import {default as React, useEffect} from 'react'
import {useGraphPut, useGraphPutEdge} from "@end-game/react-graph";
import {renderApp} from "./test/reactTestUtils.jsx";
import {GraphExplorerBtn} from "./GraphExplorerBtn.jsx";
import {concatMap, of} from "rxjs";


renderApp(() => {
    const graphPut = useGraphPut();
    const graphPutEdge = useGraphPutEdge();

    useEffect(() => {
        of(true).pipe(
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
            <GraphExplorerBtn/>
        </>
    )
});



