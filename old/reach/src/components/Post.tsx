import {usePost} from "../services/postService.js";
import {DisplayName} from "./DisplayName.js";
import {DateFromNow} from "./DateFromNow.js";
import {Nickname} from "./Nickname.js";
import {Link} from "react-router-dom";

export const Post: React.FC<{timestamp: string}> = ({timestamp}) => {
    const post = usePost(timestamp);

    const replaceMentionsWithLinks = (text: string = '') => {
        const tagOrMentions = text.match(/[@#][a-z0-9\-]*/g);
        const betweens = text.split(/[@#][a-z0-9\-]*/g);
        return betweens.reduce((result, it, idx) =>
            tagOrMentions?.[idx] ? [...result, ...[betweens[idx], getTagOrMentionLink(tagOrMentions[idx])]] : [...result, betweens[idx]], [] as any[]
        )

        function getTagOrMentionLink(tagOrMention: string) {
            return /^#/.test(tagOrMention) ? (
                <Link to={`/tag/posts/${tagOrMention.replace('#', '')}`}>{tagOrMention}</Link>) : (
                <Link to={`/user/profile-by-nick/${tagOrMention.replace('@', '')}`}>{tagOrMention}</Link>
            )
        }
    }



    return (
        <div style={{width: '100%'}}>
            <div  style={{display: 'flex'}}>
                <div style={{fontWeight: 'bold', flex: 1}}>
                    <span style={{paddingRight: 5}}>{post.owner ? <DisplayName owner={post.owner}/> : 'Loading...'}</span>
                    {post.owner ? <Nickname owner={post.owner}/> : 'Loading...'}
                    <span style={{paddingLeft: 10}}>({post.timestamp ? <DateFromNow date={new Date(post.timestamp)}/> : 'Loading...'})</span>
                </div>
            </div>
            <div>{replaceMentionsWithLinks(post.text)}</div>
        </div>
    );
}

