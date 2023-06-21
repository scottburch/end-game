import React from 'react';
import {NodeId} from "@end-game/graph";
import {useGraphNodesByProp} from "@end-game/react-graph";
import {User} from "../types/User.js";

export const ProfilePage: React.FC<{authId: NodeId}> = ({authId}) => {
    const [user] = useGraphNodesByProp<User>('user', 'ownerId', authId);

    return (
        <div>
            <h3 style={{borderBottom: '1px solid black'}}>Profile for {user?.props.display}</h3>
            <div>{user?.props.aboutMe}</div>
        </div>
    )
}