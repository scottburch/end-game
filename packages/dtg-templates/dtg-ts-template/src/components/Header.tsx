import React from "react";
import {useAuth} from "@end-game/react-graph";
import {Space} from "antd";
import {AppMenu} from "./AppMenu.jsx";

export const Header: React.FC = () => {
    const auth = useAuth();

    return (
        <header style={{background: '#0057df', color: 'white', display: 'flex', padding: 5}}>
            <div style={{flex: 1, fontSize:20}}>Reach</div>
            <Space>
                {auth.username ? <span>Welcome {auth.username}</span> : <></>}
            <AppMenu/>
            </Space>
            <div style={{paddingLeft: 10}}/>
            {/*<div><ConnectBtns/></div>*/}
        </header>
    )
}