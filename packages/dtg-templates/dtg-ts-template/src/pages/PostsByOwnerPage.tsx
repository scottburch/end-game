import React from "react";
import {useParams} from "react-router-dom";
import {asNodeId} from "@end-game/graph";
import {PostsListByOwner} from "../components/PostListByOwner.jsx";

export const PostsByOwnerPage: React.FC = () => {
    const {owner} = useParams();
    return owner ? <PostsListByOwner key={owner} owner={asNodeId(owner)}/> : 'Loading...'
}

