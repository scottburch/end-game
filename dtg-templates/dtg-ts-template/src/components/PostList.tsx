import {useGraphNodesByLabel} from "@end-game/react-graph";
import React from 'react';
import {Post} from "../types/Post.js";

export const PostList: React.FC = () => {
    const posts = useGraphNodesByLabel<Post>('post');

    return (
        <>
            {posts?.map(post => <div key={post.nodeId}>{post.props.text}</div>)}
        </>
    )
}