import React, {useState} from "react";
import {useGraphPutEdge, useGraphRelationships} from "./react-graph.jsx";
import {renderApp} from "./test/reactTestUtils.jsx";


renderApp(() => {
    const rels = useGraphRelationships('n1', 'friend', {});
    const [count, setCount] = useState(0);
    const graphPutEdge = useGraphPutEdge();


    const putNode = () => {
        graphPutEdge('friend', count.toString(), 'n1', `other-${count}`, {}).subscribe();
        setCount(count + 1);
    }

    return (
        <>
            <button id="count" onClick={putNode}/>
            {rels.map((rel, idx) => <div id={`node-${idx}`}>{rel.from}-{rel.to}</div>)}
        </>
    )
});