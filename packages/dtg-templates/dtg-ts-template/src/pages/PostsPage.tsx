import React, {useState} from "react";
import {PostList} from "../components/PostList.jsx";
import {useGraphNodesByLabel} from "@end-game/react-graph";
import {Post} from "../types/Post.js";
import {NodeId} from "@end-game/graph";
import {Button} from "antd";

export const PostsPage: React.FC = () => {
    const [last, setLast] = useState<NodeId>('');
    const posts = useGraphNodesByLabel<Post>('post', {reverse: true, limit: 5, lt: last})

    return (
        <>
            <PostList posts={posts}/>
            {posts.length ? <Button onClick={() => setLast(posts[posts.length - 1].nodeId)}>Load More</Button> : null}
        </>
    )
}