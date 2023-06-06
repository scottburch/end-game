import React from "react";
import {useAuth} from "@end-game/react-graph";
import {ConnectBtns} from "./ConnectBtns.jsx";
import {useShowProfile} from "../hooks/useRight.jsx";

export const Header: React.FC = () => {
    const auth = useAuth();
    const showProfile = useShowProfile();

    return (
        <div style={{background: 'black', color: 'white', display: 'flex'}}>
            <div style={{flex: 1}}>Endgame Starter Kit</div>
            <a id="welcome" href="#" style={{color: 'white', paddingRight: 10}} onClick={() => showProfile(auth.nodeId)}>{auth.username ? 'Welcome ' + auth.username : ''}</a>
            <div><ConnectBtns/></div>
        </div>
    )
}