import React, {useState} from "react";
import {useGraphNodesByProp, useGraphPut} from "./react-graph.jsx";
import {renderApp} from "./test/reactTestUtils.jsx";

renderApp(() => {
    const nodes = useGraphNodesByProp('person', 'group', 'first');
    const [count, setCount] = useState(0);
    const graphPut = useGraphPut();

    const putNode = () => {
        graphPut('person', count.toString(), {name: 'scott' + count, group: 'first'}).subscribe();
        setCount(count + 1);
    }

    return (
        <>
            <button id="count" onClick={putNode}/>
            {nodes.map((node, idx) => <div id={`node-${idx}`}>{node.props.name}</div>)}
        </>
    )
});