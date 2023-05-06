import * as React from 'react'
import {useGraphGet} from "@end-game/react-graph";
import {useState} from "react";

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
            {open ? (
                <div style={{paddingLeft: 20}}>
                    {Object.keys(node?.props || {}).map(key => (
                        <div key={key} style={{display: 'flex'}}>
                        <div>{key}:</div>
                            <div>{node?.props[key]}</div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}