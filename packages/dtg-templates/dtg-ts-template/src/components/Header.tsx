import React from "react";
import {useAuth} from "@end-game/react-graph";
import {Link} from 'react-router-dom'
import {Space} from "antd";
import {UserMenu} from "./UserMenu.jsx";

export const Header: React.FC = () => {
    const auth = useAuth();

    return (
        <div style={{background: '#0057df', color: 'white', display: 'flex', padding: 5}}>
            <div style={{flex: 1, fontSize:20}}>Reach</div>
            {auth.username ? (
                <UserMenu/>
            ) : (
                <Space size={5}>
                    <Link to="/login" style={{color: "white"}}>Login</Link>
                    |
                    <Link to="/signup" style={{color: 'white'}}>Signup</Link>
                </Space>
            )}
            <div style={{paddingLeft: 10}}/>
            {/*<div><ConnectBtns/></div>*/}
        </div>
    )
}