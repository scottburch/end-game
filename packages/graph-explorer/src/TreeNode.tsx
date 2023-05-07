import * as React from 'react'
import {useGraphEdge, useGraphGet, useGraphRelationships} from "@end-game/react-graph";
import type {ReactNode} from 'react';
import {useState} from "react";
import type {EdgeId, GraphNode, Props} from "@end-game/graph";

// const Plus: React.FC = () => (
//     <div style={{position: 'relative', border: '1px solid black', height: 14, width: 14}}>
//         <div style={{position: 'absolute', top: 6, left: 1, height: 2, width: 12, backgroundColor: 'black'}}></div>
//         <div style={{position: 'absolute', top: 1, left: 6, height: 12, width: 2, backgroundColor: 'red'}}></div>
//     </div>
// )



const Opener: React.FC<{ text: ReactNode, children: () => ReactNode }> = ({text, children}) => {
    const [isOpen, setOpen] = useState(false);
    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <div onClick={() => setOpen(!isOpen)} style={{
                    fontWeight: 'bold',
                    marginRight: 10,
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                }}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid black', height: 14, width: 14}}>
                    {isOpen ? '-' : '+'}
                    </div>
                </div>
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
                    <Props props={node.props}/>
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
                {() => edge?.to ? (
                    <>
                    <Props props={edge.props}/>
                    <TreeNode nodeId={edge.to}/>
                    </>
                ) : null}
            </Opener>

        </div>
    )

}

const Props: React.FC<{ props: Props}> = ({props = {}}) => (
    <div>
        {Object.keys(props).map(key => (
            <div key={key} style={{display: 'flex'}}>
                <div>{key}:</div>
                <div>{props[key]}</div>
            </div>
        ))}
    </div>
)