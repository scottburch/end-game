import React from 'react'
import logo from './logo-white.png'
import {Link} from "react-router-dom";

export const Logo:React.FC = () => {
    return (
        <Link to="/" style={{textDecoration: 'none'}}>
        <div style={{display: 'flex'}}>
            <img alt="logo" src={logo} style={{height: 100}}/>
            <div style={{display: 'flex', flexDirection: 'column', paddingTop: 20, paddingLeft: 5}}>
                <div style={{fontSize: 40, fontFamily: 'sans-serif', letterSpacing: 5, color: '#541a8b'}}>endgame</div>
                <div style={{color: '#642a9b'}}>Welcome to the new internet</div>
            </div>
        </div>
        </Link>
    )
};