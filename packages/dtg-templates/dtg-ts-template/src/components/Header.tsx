import React from "react";
import {useAuth} from "@end-game/react-graph";
import {ConnectBtns} from "./ConnectBtns.jsx";

export const Header: React.FC = () => {
    const auth = useAuth();

    return (
        <div style={{background: 'black', color: 'white', display: 'flex'}}>
            <div style={{flex: 1}}>Endgame Starter Kit</div>
            <div>{auth.username ? 'Welcome ' + auth.username : ''}</div>
            <div><ConnectBtns/></div>
        </div>
    )
}