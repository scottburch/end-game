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
                title={<Space><Owner post={(post as NodeWithAuth<Post>)}/> <DateFromNow date={new Date(post.props.timestamp)}/></Space>}
                description={replaceMentionsAndTagsWithLinks(post.props.text).map((part, idx) => <span key={idx}>{part}</span>)}
            />
        </List.Item>
    )
}

const replaceMentionsAndTagsWithLinks = (text: string = '') => {
    const tagOrMentions = text.match(/[@#][a-z0-9\-]*/g);
    const betweens = text.split(/[@#][a-z0-9\-]*/g);
    return betweens.reduce((result, it, idx) =>
        tagOrMentions?.[idx] ? [...result, ...[betweens[idx], getTagOrMentionLink(tagOrMentions[idx])]] : [...result, betweens[idx]], [] as any[]
    )

    function getTagOrMentionLink(tagOrMention: string) {
        return /^#/.test(tagOrMention) ? (
            <Link to={`/posts/tag/${tagOrMention.replace('#', '')}`}>{tagOrMention}</Link>) : (
            <Link to={`/user/profile-by-nick/${tagOrMention.replace('@', '')}`}>{tagOrMention}</Link>
        )
    }
}
