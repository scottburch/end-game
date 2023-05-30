import React from 'react';
import {useGraphNode} from "@end-game/react-graph";

export const Owner: React.FC<{nodeId: string}> = ({nodeId}) => {
    const node = useGraphNode(nodeId);

    console.log('owner: ', nodeId, node);

    return (
        node?.props.username
    )
}