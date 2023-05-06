import React from "react";
import {useParams} from "react-router";

export const ByNodeProp: React.FC = () => {
    const {prop} = useParams();
    return (
        <>
            BY NODE PROP: {prop}
        </>
    )
}