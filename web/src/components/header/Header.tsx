import React from 'react'
import {Logo} from "./Logo.jsx";
import {HeaderMenu} from "./HeaderMenu.jsx";

export const Header: React.FC = () => {
    return (
        <header style={{backgroundColor: '#ab97da', display: 'flex', color: 'white'}}>
            <div>
                <Logo/>
            </div>
            <div style={{flex: 1, display: 'flex', alignItems: 'flex-end'}}>
                <div style={{display: 'flex', flex: 1}}>
                    <div style={{flex: 1}}/>
                    <HeaderMenu/>
                </div>
            </div>
        </header>
    );
};



