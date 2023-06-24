import React from 'react';
import {useGraphNode} from "@end-game/react-graph";
import {User} from "../types/User.js";
import {useParams} from "react-router-dom";
import {asNodeId} from "@end-game/graph";

export const ProfilePage: React.FC = () => {
    const params = useParams();
    return params.userId ? <Profile userId={params.userId || ''}/> : <>Loading...</>;
}


const Profile: React.FC<{userId: string}> = ({userId}) => {
    const user = useGraphNode<User>(asNodeId(userId));

    return (
        <div>
            <h3 style={{borderBottom: '1px solid black'}}>Profile for {user?.props.display} (@{user?.props.nickname})</h3>
            <div>{user?.props.aboutMe}</div>
        </div>
    );
}