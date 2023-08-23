import React, {useRef} from 'react';
import {Post} from "../types/Post.js";
import {PostItem} from "./PostItem.jsx";
import {List} from "antd";
import {GraphNode, NodeId} from "@end-game/graph";

export const PostList: React.FC<{posts: GraphNode<Post>[]}> = ({posts}) => {
    const postList = useRef<Record<NodeId, GraphNode<Post>>>({} as Record<NodeId, GraphNode<Post>>);

    posts.map(post => postList.current[post.nodeId] = post);



    return (
        <List bordered key={Object.keys(postList.current).length.toString()}>
            {Object.values(postList.current).sort((a, b) => a.props.timestamp < b.props.timestamp ? 1 : -1).map(post => (
                <div key={post.nodeId}>
                    <PostItem post={post}/>
                </div>
            ))}
        </List>
    )
}