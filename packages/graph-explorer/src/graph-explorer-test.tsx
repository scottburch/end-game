import {default as React, useEffect} from 'react'
import {useGraphGet, useGraphPut} from "@end-game/react-graph";
import {renderApp} from "./test/reactTestUtils.jsx";
import {GraphExplorerBtn} from "./GraphExplorerBtn.jsx";



    renderApp(() => {
        const node = useGraphGet('1');
        const graphPut = useGraphPut();

        useEffect(() => {
            graphPut('person', '', {name: 'scott'}).subscribe();
            graphPut('person', '', {name: 'todd'}).subscribe()
        }, [])

        return (
            <>
                <GraphExplorerBtn/>
            </>
        )
    });



