import {useGraphPut} from "@end-game/react-graph";
import type {Post} from "../types/Post.js";
import {useState} from "react";
import React from 'react';

export const AddPostPanel: React.FC = () => {
    const graphPut = useGraphPut<Post>();
    const [values, setValues] = useState<Post>();

    const addPost = () => {
        graphPut('post', '', values as Post).subscribe();
    }

    return (
        <>
            <div>Add a post</div>
            <textarea onBlur={ev => setValues({...values, text: ev.target.value})}/>
            <div><button onClick={addPost}>Add Post</button></div>
        </>
    );
}