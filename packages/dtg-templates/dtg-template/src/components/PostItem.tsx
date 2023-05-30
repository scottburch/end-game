import React from 'react'
import {Post} from '../types/Post.js'
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Owner} from "./Owner.jsx";
import {GraphNode} from "@end-game/graph";

export const PostItem:React.FC<{post: GraphNode<Post>}> = ({post}) => {


    return (
        <div style={{border: '2px solid black'}}>
            <div style={{fontWeight: "bold"}}>
                {(post as NodeWithAuth<Post>)?.owner ? <Owner post={(post as NodeWithAuth<Post>)}/> : null}
            </div>
            <div>
                {post.props.text}
            </div>
        </div>
    )
}