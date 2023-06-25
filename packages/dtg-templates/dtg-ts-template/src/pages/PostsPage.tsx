import React from "react";
import {PostList} from "../components/PostList.jsx";
import {useGraphNodesByLabel} from "@end-game/react-graph";
import {Post} from "../types/Post.js";

export const PostsPage: React.FC = () => {
    const posts = useGraphNodesByLabel<Post>('post', {reverse: true});

    return (
        <PostList posts={posts}/>
    )
}