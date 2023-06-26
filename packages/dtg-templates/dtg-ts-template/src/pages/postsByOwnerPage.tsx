import React from "react";
import {useParams} from "react-router-dom";
import {useGraphNodesByProp} from "@end-game/react-graph";
import {PostList} from "../components/PostList.jsx";
import {Post} from "../types/Post.js";
import {asNodeId, NodeId} from "@end-game/graph";

export const PostsByOwnerPage: React.FC = () => {
    const {owner} = useParams();
    return owner ? <PostsListByOwner key={owner} owner={asNodeId(owner)}/> : 'Loading...'
}

const PostsListByOwner: React.FC<{owner: NodeId}> = ({owner}) => {
    const posts = useGraphNodesByProp<Post>('post', 'owner', owner, {reverse: true});
    return <PostList posts={posts}/>
}
