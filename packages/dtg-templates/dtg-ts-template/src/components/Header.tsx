import React from "react";
import {useAuth} from "@end-game/react-graph";
import {Space} from "antd";
import {AppMenu} from "./AppMenu.jsx";
import {ConnectBtns} from "./ConnectBtns.jsx";

export const Header: React.FC = () => {
    const auth = useAuth();

    return (
        <>
            <div style={{flex: 1, fontSize:30}}>Reach</div>
            <Space>
                {auth.username ? <span>Welcome {auth.username}</span> : <></>}
            <AppMenu/>
            </Space>
            <div style={{paddingLeft: 10}}/>
            <div><ConnectBtns/></div>
        </>
    )
}