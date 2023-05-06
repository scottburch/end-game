import * as React from 'react'
import {useGraphEdge, useGraphGet, useGraphRelationships} from "@end-game/react-graph";
import {useState} from "react";
import type {EdgeId, GraphNode} from "@end-game/graph";

export const TreeNode: React.FC<{nodeId: string}> = ({nodeId}) => {
    const node = useGraphGet(nodeId);
    const [open, setOpen] = useState(false);

    return (
        <div>
        <div style={{display: 'flex'}}>
            <div style={{fontWeight: 'bold', marginRight: 10, cursor: 'pointer', fontFamily: 'monospace'}} onClick={() => setOpen(!open)}>{open ? '-' : '+'}</div>
            <div style={{marginRight: 10}}>{node?.label}</div>
            <div>({node?.nodeId})</div>
        </div>
            {(open && node) ? (
                <div style={{paddingLeft: 20}}>
                    <NodeProps node={node}/>
                    <NodeRelationships node={node}/>
                </div>
            ) : null}
        </div>
    )
}

const NodeRelationships: React.FC<{node: GraphNode<any>}> = ({node}) => {
    const rels = useGraphRelationships(node.nodeId, '*', {});

    return (
        <>
            {rels.map(rel => <NodeRelationship edgeId={rel.edgeId}/>)}
        </>
    )
}

const NodeRelationship: React.FC<{edgeId: EdgeId}> = ({edgeId}) => {
    const edge = useGraphEdge(edgeId);

    return (
        <>
            {edge?.rel} - {edge?.edgeId} - {edge?.to}
        </>
    )

}

const NodeProps: React.FC<{node: GraphNode<any>}> = ({node}) => (
    <div>
        {Object.keys(node?.props || {}).map(key => (
            <div key={key} style={{display: 'flex'}}>
                <div>{key}:</div>
                <div>{node?.props[key]}</div>
            </div>
        ))}
    </div>
)