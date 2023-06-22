import {useGraphNodesByLabel} from "@end-game/react-graph";
import React from 'react';
import {Post} from "../types/Post.js";
import {PostItem} from "./PostItem.jsx";
import {List} from "antd";

export const PostList: React.FC = () => {
    const posts = useGraphNodesByLabel<Post>('post');

    return (
        <List>
            {posts?.map(post => (
                <div key={post.nodeId}>
                    <PostItem post={post}/>
                </div>
            ))}
        </List>
    )
}