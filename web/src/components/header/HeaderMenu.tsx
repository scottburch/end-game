import React from "react";
import {Link} from "react-router-dom";
import {Space} from "antd";

export const HeaderMenu: React.FC = () => {
    return (
        <Space>
            <Link style={{color: 'white', textDecoration: 'none'}} to="/getting-started">Getting Started</Link> |
            <Link style={{color: 'white', textDecoration: 'none'}} to="/docs">Documentation</Link> |
            <Link style={{color: 'white', textDecoration: 'none'}} to="/">Home</Link>
        </Space>
    );

};

