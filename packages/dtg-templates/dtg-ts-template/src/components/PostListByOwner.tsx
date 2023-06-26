import React from "react";
import {NodeId} from "@end-game/graph";
import {useGraphNodesByProp} from "@end-game/react-graph";
import {Post} from "../types/Post.js";
import {PostList} from "./PostList.jsx";

export const PostsListByOwner: React.FC<{owner: NodeId}> = ({owner}) => {
    const posts = useGraphNodesByProp<Post>('post', 'owner', owner, {reverse: true});
    return <PostList posts={posts}/>
}
