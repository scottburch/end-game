import React, {useEffect, useRef, useState} from "react";
import {PostList} from "../components/PostList.jsx";
import {useGraphs} from "@end-game/react-graph";
import {Post} from "../types/Post.js";
import {debounceTime, Subscription, tap} from "rxjs";
import {GraphNode, NodeId, nodesByLabel} from "@end-game/graph";
import {Button} from "antd";

export const PostsPage: React.FC = () => {
    const graph = useGraphs();
    const postsSub = useRef<Subscription>();
    const [posts, setPosts] = useState<GraphNode<Post>[]>([]);

    const loadPosts = (last: NodeId) => {
        postsSub.current && postsSub.current.unsubscribe();
        postsSub.current = nodesByLabel<Post>(graph, 'post', {reverse: true, limit: 5, lt: last}).pipe(
            debounceTime(50),
            tap(({nodes}) => setPosts(nodes)),
        ).subscribe()
    }

    useEffect(() => {
        loadPosts('');
        return () => postsSub.current?.unsubscribe();
    }, [])

    return (
        <>
            <PostList posts={posts}/>
            {posts.length ? <Button onClick={() => loadPosts(posts[posts.length - 1].nodeId)}>Load More</Button> : null}
        </>
    )
}