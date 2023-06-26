import React from "react";
import {useParams} from "react-router-dom";
import { useGraphNodesByProp} from "@end-game/react-graph";
import {PostsListByOwner} from "../components/PostListByOwner.jsx";
import {User} from "../types/User.js";

export const PostsByNickPage: React.FC = () => {
    const {nick} = useParams();

    return nick ? <UserForNick nick={nick}/> : 'Loading...'
}

const UserForNick: React.FC<{nick: string}> = ({nick}) => {
    const [user] = useGraphNodesByProp<User>('user', 'nickname', nick);

    console.log('user', user);

    return user ? <PostsListByOwner owner={user.props.ownerId} /> : 'Loading...'
}

