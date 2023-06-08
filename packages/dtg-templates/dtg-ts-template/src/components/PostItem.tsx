import React from 'react'
import {Post} from '../types/Post.js'
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Owner} from "./Owner.jsx";
import {GraphNode} from "@end-game/graph";
import {List, Space} from "antd";
import {DateFromNow} from "./DateFromNow.jsx";
import {Link} from "react-router-dom";

export const PostItem:React.FC<{post: GraphNode<Post>}> = ({post}) => {

    return (
        <List.Item>
            <List.Item.Meta
                title={
                <Space>
                    <Owner post={(post as NodeWithAuth<Post>)}/>
                    <span style={{fontSize: 11}}><DateFromNow date={new Date(post.props.timestamp)}/></span>
                </Space>}
                description={replaceMentionsAndTagsWithLinks(post).map((part, idx) => <span key={idx}>{part}</span>)}
            />
        </List.Item>
    )
}

const replaceMentionsAndTagsWithLinks = (post: GraphNode<Post>) => {
    const tagOrMentions = post.props.text.match(/[@#][a-z0-9\-]*/g);
    const betweens = post.props.text.split(/[@#][a-z0-9\-]*/g);
    return betweens.reduce((result, it, idx) =>
        tagOrMentions?.[idx] ? [...result, ...[betweens[idx], getTagOrMentionLink(post, tagOrMentions[idx])]] : [...result, betweens[idx]], [] as any[]
    )

    function getTagOrMentionLink(post: GraphNode<Post>, tagOrMention: string) {
        return /^#/.test(tagOrMention) ? (
            <Link to={`/posts/tag/${tagOrMention.replace('#', '')}`}>{tagOrMention}</Link>) : (
            <Link to={`/posts/by-nick/${tagOrMention.replace('@', '')}`}>{tagOrMention}</Link>
        )
    }
}
