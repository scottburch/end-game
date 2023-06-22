import React, {useState} from "react";
import {Drawer, List, Space} from "antd";
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
            <List>
                <List.Item onClick={() => setOpen(false)}><Link to="/logout">Logout</Link></List.Item>
                <List.Item onClick={() => setOpen(false)}><Link to="/my-profile">My Profile</Link></List.Item>
                <List.Item onClick={() => setOpen(false)}><Link to="/add-post">Add Post</Link></List.Item>
            </List>
        </Drawer>
        </>
    )
};