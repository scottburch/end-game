import React from "react";

import {useNavigate} from "react-router";
import {Link} from "react-router-dom";
import {Menu} from "antd";

export const HeaderMenu: React.FC = () => {
    const navigate = useNavigate();


    return (
        <Menu mode="horizontal">
            <Menu.Item>
                <Link to="/getting-started">Getting Started</Link>
            </Menu.Item>

        </Menu>
    );

};

