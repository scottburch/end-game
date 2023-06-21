import React, {useState} from "react";
import {Drawer, Menu, Space} from "antd";
import {UserOutlined} from "@ant-design/icons";
import {useAuth} from "@end-game/react-graph";
import {Link} from "react-router-dom";

export const UserMenu: React.FC = () => {
    const [open, setOpen] = useState(false);
    const auth = useAuth();

    return (
        <>
            <Space id="user-menu-btn" style={{cursor: 'pointer'}} onClick={() => setOpen(!open)}>{auth.username}<UserOutlined reversed={true} rev=""/></Space>
        <Drawer
            title={`Welcome ${auth.username}`}
            placement="left"
            closable={true}
            open={open}
            onClose={() => setOpen(false)}
            key="user-menu-drawer"
        >
            <Menu onSelect={() => setOpen(false)}>
                <Menu.Item><Link to="/logout">Logout</Link></Menu.Item>
                <Menu.Item><Link to="/my-profile">My Profile</Link></Menu.Item>
            </Menu>
        </Drawer>
        </>
    )
};