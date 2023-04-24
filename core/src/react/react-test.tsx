import React, {useEffect, useState} from "react";
import {of, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {ReactGraph, useGraphNodesByLabel, useGraphPut} from "./react-graph.tsx";


const Foo: React.FC = () => {
    const nodes = useGraphNodesByLabel('person');

    return <div>{nodes?.map(node => node.props.name)}</div>
}

export default function Body() {
    const graphPut = useGraphPut();
    const [nodeId, setNodeId] = useState<string>();


    useEffect(() => {
        setTimeout(() => {
            graphPut('person', {name: 'scott'}).subscribe(({nodeId}) => setNodeId(nodeId));
        }, 1000)
    }, [])

    return nodeId ? (<Foo />) : (<div>Loading...</div>);
}

const MyApp: React.FC = () => {
    return (
        <ReactGraph>
            <Body/>
        </ReactGraph>
    )
};

of(createRoot(document.querySelector('#app') as Element)).pipe(
    tap(root => root.render(<MyApp/>))
).subscribe();
