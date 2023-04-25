import React, {useEffect, useState} from "react";
import {of, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {ReactGraph, useGraphNodesByLabel, useGraphPut} from "../react/react-graph.tsx";
import {Graph} from "@end-game/graph";


// const Foo: React.FC = () => {
//     const nodes = useGraphNodesByLabel('person');
//     return <div>{nodes?.map(node => node.props.name)}</div>
// }
//
// export const Body = () => {
//     const graphPut = useGraphPut();
//     const [nodeId, setNodeId] = useState<string>();
//
//
//     useEffect(() => {
//         setTimeout(() => {
//             graphPut('person', '', {name: 'scott'}).subscribe(({nodeId}) => setNodeId(nodeId));
//         }, 1000)
//     }, [])
//
//     return nodeId ? (<Foo />) : (<div>Loading...</div>);
// }

export const renderApp = (Body: React.FC, graph?: Graph) => {
    const MyApp: React.FC = () => {
        return (
            <ReactGraph graph={graph}>
                <Body/>
            </ReactGraph>
        )
    };


    of(createRoot(document.querySelector('#app') as Element)).pipe(
        tap(root => root.render(<MyApp/>))
    ).subscribe();
}


