import React from 'react';
import {Post} from "../types/Post.js";
import {PostItem} from "./PostItem.jsx";
import {List} from "antd";
import {GraphNode} from "@end-game/graph";

export const PostList: React.FC<{posts: GraphNode<Post>[]}> = ({posts}) => {

    return (
        <List bordered>
            {posts?.map(post => (
                <div key={post.nodeId}>
                    <PostItem post={post}/>
                </div>
            ))}
        </List>
    )
}