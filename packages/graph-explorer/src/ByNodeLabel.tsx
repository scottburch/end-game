import React from "react";
import {useParams} from "react-router";

export const ByNodeLabel: React.FC = () => {
    const {label} = useParams();
    return (
        <>
            BY NODE LABEL: {label}
        </>
    )
}