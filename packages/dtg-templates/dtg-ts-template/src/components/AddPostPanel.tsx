import {useGraphPut} from "@end-game/react-graph";
import type {Post} from "../types/Post.js";
import {useRef, useState} from "react";
import React from 'react';
import {nodeId, NodeId} from "@end-game/graph";

export const AddPostPanel: React.FC = () => {
    const graphPut = useGraphPut<Post>();
    const [values, setValues] = useState<Omit<Post, 'nodeId'>>({text: ''});

    const addPost = () => {
        graphPut('post', nodeId(Date.now().toString()), values as Post).subscribe();
        setValues({text: ''});
    }

    return (
        <>
            <div>Add a post</div>
            <textarea value={values.text} id="post-text" onChange={ev => setValues({...values, text: ev.target.value})}/>
            <div><button onClick={addPost}>Add Post</button></div>
        </>
    );
}