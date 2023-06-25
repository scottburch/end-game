import React from "react";
import {useParams} from "react-router-dom";

export const PostsByTagPage: React.FC = () => {
    const {tag} = useParams();
    return (<>posts by tag - {tag}</>)
}