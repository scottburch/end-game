import React from "react";
import {useAuth} from "@end-game/react-graph";
import {ConnectBtns} from "./ConnectBtns.jsx";
import {Link} from 'react-router-dom'

export const Header: React.FC = () => {
    const auth = useAuth();

    return (
        <div style={{background: 'black', color: 'white', display: 'flex'}}>
            <div style={{flex: 1}}>Reach</div>
            {auth.username ? (
                <Link to="/my-profile" style={{color: 'white', paddingRight: 10}} >{auth.username ? 'Welcome ' + auth.username : ''}</Link>
            ) : (
                <div style={{color: 'white', paddingRight: 10}}>
                    <Link to="/login" style={{color: "white"}}>Login</Link>
                    <span style={{paddingLeft: 5, paddingRight: 5}}>or</span>
                    <Link to="/signup" style={{color: 'white'}}>Signup</Link>
                </div>
            )}
            <div><ConnectBtns/></div>
        </div>
    )
}