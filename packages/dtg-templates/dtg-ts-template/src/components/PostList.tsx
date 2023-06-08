import React, {useRef} from 'react';
import {Post} from "../types/Post.js";
import {PostItem} from "./PostItem.jsx";
import {List} from "antd";
import {GraphNode, NodeId} from "@end-game/graph";

export const PostList: React.FC<{posts: GraphNode<Post>[]}> = ({posts}) => {
    const postList = useRef<Record<NodeId, GraphNode<Post>>>({} as Record<NodeId, GraphNode<Post>>);

    posts.map(post => postList.current[post.nodeId] = post);



    return (
        <List bordered>
            {Object.values(postList.current).map(post => (
                <div key={post.nodeId}>
                    <PostItem post={post}/>
                </div>
            ))}
        </List>
    )
}