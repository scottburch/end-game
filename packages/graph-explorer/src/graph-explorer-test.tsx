import {default as React, useEffect} from 'react'
import {useGraphPut, useGraphPutEdge} from "@end-game/react-graph";
import {renderApp} from "./test/reactTestUtils.jsx";
import {GraphExplorerBtn} from "./GraphExplorerBtn.jsx";
import {combineLatest} from "rxjs";


renderApp(() => {
    const graphPut = useGraphPut();
    const graphPutEdge = useGraphPutEdge();

    useEffect(() => {
        combineLatest([
            graphPut('person', 'scott', {name: 'scott', age: 1}),
            graphPut('person', 'todd', {name: 'todd', age: 2}),

            graphPutEdge('friend', '', 'scott', 'todd', {}),
            graphPutEdge('friend', '', 'todd', 'scott', {}),

            graphPut('country', 'canada', {name: 'canada'}),
            graphPutEdge('lives_in', '', 'scott', 'canada', {})
        ]).subscribe()
    }, [])

    return (
        <>
            <GraphExplorerBtn/>
        </>
    )
});



