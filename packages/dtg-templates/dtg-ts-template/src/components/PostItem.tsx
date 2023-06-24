import React from 'react'
import {Post} from '../types/Post.js'
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Owner} from "./Owner.jsx";
import {GraphNode} from "@end-game/graph";
import {List, Space} from "antd";
import {DateFromNow} from "./DateFromNow.jsx";

export const PostItem:React.FC<{post: GraphNode<Post>}> = ({post}) => {

    return (
        <List.Item>
            <List.Item.Meta
                title={<Space><Owner post={(post as NodeWithAuth<Post>)}/> <DateFromNow date={new Date(post.props.timestamp)}/></Space>}
                description={post.props.text}
            />
        </List.Item>
    )
}