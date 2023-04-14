import {pistolLogout, usePistolAuth} from "@scottburch/pistol";
import {Button, Drawer} from "antd";
import {setMenuOpen, useIsMenuOpen} from "../appState.js";
import React from "react";
import {useNavigate} from "react-router-dom";
import {SideMenu} from "./SideMenu.js";
import {firstValueFrom, tap} from "rxjs";



export const MenuDrawer: React.FC = () => {
    const auth = usePistolAuth();
    const isMenuOpen = useIsMenuOpen();

    return (
        <Drawer
            width="auto"
            title={auth.pubKeyHex ? <LoggedInTitle/> : <LoginBtn/>}
            placement="left"
            closable={false}
            onClose={() => setMenuOpen(false)}
            open={isMenuOpen}
        >
            <SideMenu/>
        </Drawer>
    )
}

const LoggedInTitle: React.FC = () => {
    const auth = usePistolAuth();
    const navigate = useNavigate();

    const doLogout = () => firstValueFrom(pistolLogout().pipe(
        tap(() => navigate('/'))
    ));

    return (
    <>
        <span style={{paddingRight: 10}}>
            {auth.username}
        </span>
        <Button type="default" onClick={doLogout}>Logout</Button>
    </>
)}



const LoginBtn: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Button style={{width: '100%'}} onClick={() => navigate('/login')}>Login</Button>
    );
}

