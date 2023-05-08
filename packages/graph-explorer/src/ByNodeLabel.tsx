import React from "react";
import {useParams} from "react-router";
import {useGraphNodesByLabel} from "@end-game/react-graph";
import {TreeNode} from "./TreeNode.js";

export const ByNodeLabel: React.FC = () => {
    const {label} = useParams();
    return (
        <>
            <h3>Nodes by label: {label}</h3>
            {label && <NodesByLabelTree key={label} label={label}/>}
        </>
    )
}

const NodesByLabelTree: React.FC<{label: string}> = ({label}) => {
    const nodes = useGraphNodesByLabel(label);

    return (
        <div>
            {nodes.map(node => <TreeNode key={node.nodeId} nodeId={node.nodeId}/>)}
        </div>
    )

}