import React from 'react';
import {useGraphNodesByProp} from "@end-game/react-graph";
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Post} from "../types/Post.js";
import {User} from "../types/User.js";
import {Link} from "react-router-dom";


export const Owner: React.FC<{post: NodeWithAuth<Post>}> = ({post}) => {
    const profileNodes = useGraphNodesByProp<User>('user', 'ownerId', post.owner);

    return (
        <Link to={`/profile/${profileNodes[0]?.nodeId}`}>{`${profileNodes[0]?.props.display} (@${profileNodes[0]?.props.nickname})` || 'Loading...'}</Link>
    )
}