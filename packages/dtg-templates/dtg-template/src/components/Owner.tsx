import React from 'react';
import {useGraphNodesByProp} from "@end-game/react-graph";
import {NodeWithAuth} from "@end-game/pwd-auth";
import {Post} from "../types/Post.js";
import {User} from "../types/User.js";
import {map, of, tap} from "rxjs";

export const Owner: React.FC<{post: NodeWithAuth<Post>}> = ({post}) => {
    const profileNodes = useGraphNodesByProp<User>('user', 'ownerId', post.owner);

    const showProfile = () => of(profileNodes[0]).pipe(
        map(profile => (`${profile.props.display}\n---------------\n${profile.props.aboutMe}`)),
        tap(v => alert(v))
    ).subscribe()

    return (
        <a href="#" onClick={showProfile}>{profileNodes[0]?.props.display || 'Loading...'}</a>
    )
}