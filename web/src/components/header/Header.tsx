import React from 'react'
import {Logo} from "./Logo.jsx";
import {HeaderMenu} from "./HeaderMenu.jsx";
import {SocialLinks} from "./SocialLinks.jsx";

export const Header: React.FC = () => {
    return (
        <header style={{backgroundColor: '#ab97da', display: 'flex', color: 'white'}}>
                <div>
                    <Logo/>
                </div>
            <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
                <div style={{flex: 1, textAlign: 'end', padding: 5}}>
                    <SocialLinks/>
                </div>

                <div style={{
                    display: 'flex',
                    flex: 1,
                    alignItems: 'end',
                    justifyContent: 'end',
                    padding: 5,
                }}>
                    <HeaderMenu/>
                </div>
            </div>
        </header>
    );
};



