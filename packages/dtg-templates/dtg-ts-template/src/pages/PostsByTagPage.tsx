import React from "react";
import {useParams} from "react-router-dom";
import {useGraphNodesByProp} from "@end-game/react-graph";
import {PostList} from "../components/PostList.jsx";
import {Post} from "../types/Post.js";

export const PostsByTagPage: React.FC = () => {
    const {tag} = useParams();
    return tag ? <PostsListByTag key={tag} tag={tag}/> : 'Loading...'
}

const PostsListByTag: React.FC<{tag: string}> = ({tag}) => {
    const posts = useGraphNodesByProp<Post>('post', 'tags', tag);
    return <PostList posts={posts}/>
}
