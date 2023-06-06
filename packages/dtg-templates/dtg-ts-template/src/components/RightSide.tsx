import React from 'react';
import {MyProfilePanel} from "./MyProfilePanel.jsx";
import {useRightSide} from "../hooks/useRight.jsx";
import {useAuth} from "@end-game/react-graph";
import {ProfilePanel} from "./ProfilePanel.jsx";

export const RightSide: React.FC = () => {
    const {cmd, data} = useRightSide();
    const auth = useAuth()

    return (
        <div>
            {cmd === 'profile' && data === auth.nodeId && <MyProfilePanel/>}
            {cmd === 'profile' && data !== auth.nodeId && <ProfilePanel authId={data}/>}
        </div>
    )
}