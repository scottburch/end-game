import React, {useEffect, useRef, useState} from "react";
import {GraphNode, NodeId, nodesByLabel, nodesByProp} from "@end-game/graph";
import {useGraphs, useGraphNodesByProp} from "@end-game/react-graph";
import {Post} from "../types/Post.js";
import {PostList} from "./PostList.jsx";
import {debounceTime, Subscription, tap} from "rxjs";
import {Button} from "antd";

export const PostsListByOwner: React.FC<{owner: NodeId}> = ({owner}) => {
    const graph = useGraphs();
    const postsSub = useRef<Subscription>();
    const [posts, setPosts] = useState<GraphNode<Post>[]>([]);

    const loadPosts = (last: NodeId) => {
        postsSub.current && postsSub.current.unsubscribe();
        postsSub.current = nodesByProp<Post>(graph.diskGraph, 'post', 'owner', owner, {reverse: true, limit: 5, lt: last}).pipe(
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
};
