import React from "react";
import {useParams} from "react-router";
import {TreeNode} from "./TreeNode.jsx";
import {asNodeId} from "@end-game/graph";

export const ByNodeId: React.FC = () => {
    const {nodeId} = useParams();
    return (
        <>
            <h3>Nodes by Id: {nodeId}</h3>
            {nodeId && <NodesByNodeIdTree key={nodeId} nodeId={nodeId}/>}
        </>
    )
}

const NodesByNodeIdTree: React.FC<{ nodeId: string }> = ({nodeId}) => (
    <div>
        <TreeNode key={nodeId} nodeId={asNodeId(nodeId)}/>
    </div>
);

