import React from 'react';
import {useGraphNodesByProp} from "@end-game/react-graph";
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Post} from "../types/Post.js";
import {User} from "../types/User.js";
import {useShowProfile} from "../hooks/useRight.jsx";

export const Owner: React.FC<{post: NodeWithAuth<Post>}> = ({post}) => {
    const profileNodes = useGraphNodesByProp<User>('user', 'ownerId', post.owner);
    const showProfile = useShowProfile();

    return (
        <a href="#" onClick={() => showProfile(post.owner)}>{profileNodes[0]?.props.display || 'Loading...'}</a>
    )
}