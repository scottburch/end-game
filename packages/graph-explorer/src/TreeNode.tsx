import * as React from 'react'
import {useGraphEdge, useGraphGet, useGraphRelationships} from "@end-game/react-graph";
import type {ReactNode} from 'react';
import {useState} from "react";
import type {EdgeId, GraphNode} from "@end-game/graph";

const Opener: React.FC<{ text: ReactNode, children: () => ReactNode }> = ({text, children}) => {
    const [isOpen, setOpen] = useState(false);
    return (
        <div>
            <div style={{display: 'flex'}}>
                <div onClick={() => setOpen(!isOpen)} style={{
                    fontWeight: 'bold',
                    marginRight: 10,
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                }}>{isOpen ? '-' : '+'}</div>
                <div>{text}</div>
            </div>
            <div style={{paddingLeft: 10}}>
                {isOpen ? children() : null}
            </div>
        </div>
    )

}


export const TreeNode: React.FC<{ nodeId: string }> = ({nodeId}) => {
    const node = useGraphGet(nodeId);

    return (
        <div>
            <Opener text={<>{node?.label} - ({node?.nodeId})</>}>
                {() => node ? (
                <div style={{paddingLeft: 20}}>
                    <NodeProps node={node}/>
                    <NodeRelationships node={node}/>
                </div>
                ) : null}
            </Opener>
        </div>
    )
}

const NodeRelationships: React.FC<{ node: GraphNode<any> }> = ({node}) => {
    const edges = useGraphRelationships(node.nodeId, '*', {});

    return (
        <div style={{paddingLeft: 10}}>
            {edges.map(rel => <Edge key={rel.edgeId} edgeId={rel.edgeId}/>)}
        </div>
    )
}

const Edge: React.FC<{ edgeId: EdgeId }> = ({edgeId}) => {
    const edge = useGraphEdge(edgeId);

    return (
        <div style={{display: 'flex'}}>
            <Opener text={<>{edge?.rel} ({edge?.edgeId})</>}>
                {() => <div></div>}
            </Opener>

        </div>
    )

}

const NodeProps: React.FC<{ node: GraphNode<any> }> = ({node}) => (
    <div>
        {Object.keys(node?.props || {}).map(key => (
            <div key={key} style={{display: 'flex'}}>
                <div>{key}:</div>
                <div>{node?.props[key]}</div>
            </div>
        ))}
    </div>
)