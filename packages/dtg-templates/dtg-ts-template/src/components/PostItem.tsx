import React from 'react'
import {Post} from '../types/Post.js'
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Owner} from "./Owner.jsx";
import {GraphNode} from "@end-game/graph";
import {List} from "antd";

export const PostItem:React.FC<{post: GraphNode<Post>}> = ({post}) => {

    return (
        <List.Item style={{borderBottom: '1px solid #888', borderTop: '1px solid #888', borderCollapse: 'collapse'}}>
            <List.Item.Meta
                title={<Owner post={(post as NodeWithAuth<Post>)}/>}
                description={post.props.text}
            />
        </List.Item>
    )
}