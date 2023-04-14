import React from 'react'
import {Logo} from "./Logo.jsx";
import {HeaderMenu} from "./HeaderMenu.jsx";

export const Header: React.FC = () => {
    return (
        <header style={{backgroundColor: '#ab97da', display: 'flex', color: 'white'}}>
                <Logo/>
            <div style={{display: 'flex', flex: 1, alignItems: 'end', justifyContent: 'end', paddingBottom: 5}}>
                <HeaderMenu/>
            </div>
        </header>
    );
};



