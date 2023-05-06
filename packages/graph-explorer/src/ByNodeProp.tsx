import React from "react";
import {useParams} from "react-router";
import {useGraphNodesByProp} from "@end-game/react-graph";

export const ByNodeProp: React.FC = () => {
    const {prop: propString} = useParams();
    const [label, prop, value] = (propString || '').split(':');
    console.log("***", label, prop, value)
    return (
        <>
            <h3>BY NODE PROP: {propString}</h3>
            <NodesByPropTree key={propString} label={label} prop={prop} value={value}/>
        </>
    )
}

const NodesByPropTree: React.FC<{label: string, prop: string, value: string}> = ({label, prop, value}) => {
    const nodes = useGraphNodesByProp(label, prop, value);

    return (
        <div>
            {nodes.map(node => <div>{node.nodeId} - {JSON.stringify(node.props)}</div>)}
        </div>
    )

}