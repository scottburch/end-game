import React from 'react'
import {Logo} from "./Logo.jsx";
import {Menu, MenuProps} from "antd";

export const Header: React.FC = () => {
    return (
        <header style={{backgroundColor: '#ab97da', display: 'flex', color: 'white'}}>
            <div>
                <Logo/>
            </div>
            <div style={{flex: 1, display: 'flex', alignItems: 'flex-end'}}>
                <div style={{display: 'flex', flex: 1}}>
                    <div style={{flex: 1}}/>
                    <Menu mode="horizontal" style={{backgroundColor: '#ab97da', width: '80%', color: 'white'}} items={getItems()}/>
                </div>
            </div>
        </header>
    )
};

const getItems = (): MenuProps['items'] => [{
    key: 'home',
    label: 'Home'
}, {
    key: 'getting-started',
    label: 'Getting Started'
}]