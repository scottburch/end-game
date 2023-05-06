import React from "react";
import {useGraph, useGraphNodesByLabel} from "@end-game/react-graph";

export const GraphExplorer: React.FC = () => {
    const graph = useGraph();
    const people = useGraphNodesByLabel('person');
    return (
        <>
            Graph Explorer {people.map(person => person.props.name)}
        </>
    )
}