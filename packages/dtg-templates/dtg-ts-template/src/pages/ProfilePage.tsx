import React from 'react';
import {useGraphNode} from "@end-game/react-graph";
import {User} from "../types/User.js";
import {useParams} from "react-router";
import {asNodeId} from "@end-game/graph";

export const ProfilePage: React.FC = () => {
    const {userId} = useParams();

    return userId ? <Profile userId={userId || ''}/> : <h3>User Unknown: ${userId}</h3>;
}


const Profile: React.FC<{userId: string}> = ({userId}) => {
    const user = useGraphNode<User>(asNodeId(userId));

    return (
        <div>
            <h3 style={{borderBottom: '1px solid black'}}>Profile for {user?.props.display}</h3>
            <div>{user?.props.aboutMe}</div>
        </div>
    )

}