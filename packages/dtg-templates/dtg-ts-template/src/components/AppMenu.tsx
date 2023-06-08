import React, {useState} from "react";
import {Drawer, List, Space} from "antd";
import {MenuOutlined} from "@ant-design/icons";
import {useAuth} from "@end-game/react-graph";
import {Link} from "react-router-dom";

export const AppMenu: React.FC = () => {
    const [open, setOpen] = useState(false);
    const auth = useAuth();

    return (
        <>
            <Space id="menu-btn" style={{cursor: 'pointer'}} onClick={() => setOpen(!open)}><MenuOutlined  rev="" style={{fontSize: 20}}/></Space>
        <Drawer
            title={`Welcome ${auth.username}`}
            placement="left"
            closable={true}
            open={open}
            onClose={() => setOpen(false)}
            key="user-menu-drawer"
        >
            <List>
                <List.Item onClick={() => setOpen(false)}><Link to="/">Home</Link></List.Item>
                {auth.username ? (
                    <>
                    <List.Item onClick={() => setOpen(false)}><Link to="/logout">Logout</Link></List.Item>
                    <List.Item onClick={() => setOpen(false)}><Link to="/my-profile">My Profile</Link></List.Item>
                    <List.Item onClick={() => setOpen(false)}><Link to="/add-post">Add Post</Link></List.Item>
                    </>
                ) : (
                    <>
                        <List.Item onClick={() => setOpen(false)}><Link to="/login" >Login</Link></List.Item>
                        <List.Item onClick={() => setOpen(false)}><Link to="/signup">Signup</Link></List.Item>
                    </>
                )}
            </List>
        </Drawer>
        </>
    )
};