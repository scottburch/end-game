import {renderApp} from "@end-game/react-graph";
import {useGraphNodesByLabel, useGraphPut} from "@end-game/react-graph";
import React, {useState} from "react";

renderApp(() => {
    const nodes = useGraphNodesByLabel('person');
    const [count, setCount] = useState(0);
    const graphPut = useGraphPut();

    const putNode = () => {
        graphPut('person', count.toString(), {name: 'scott' + count}).subscribe();
        setCount(count + 1);
    }

    return (
        <>
            <button id="count" onClick={putNode}/>
            {nodes?.map((node, idx) => <div id={`node-${idx}`}>{node.props.name}</div>)}
        </>
    )
});