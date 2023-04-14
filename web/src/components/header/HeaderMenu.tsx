import {useGraphNodesByLabel, useGraphPut} from "@end-game/react-graph";
import React, {useEffect} from "react";

import {initHeaderMenu} from "../../stores/headerMenuStore.js";
import {useNavigate} from "react-router";
import {NavLink, NavLinkProps} from "react-router-dom";

export const HeaderMenu: React.FC = () => {
    const menuItems = useGraphNodesByLabel<{key: string, label: string}>('header-menu-item');
    const put = useGraphPut();
    const navigate = useNavigate();

    useEffect(() => {
        initHeaderMenu(put)
    }, []);


    const items = menuItems.map(it => it.props)

    const navLinkStyle: NavLinkProps['style']  = ({isActive, isPending}) => ({
        color: isActive ? '#ddd' : 'white',
        textDecoration: 'none'

    });

    return (
        <>
            {items.map(it => (
                <span style={{paddingRight: 20}}>
                    <NavLink to={it.key} style={navLinkStyle}>
                        {it.label}
                    </NavLink>
                </span>
            ))}
        </>
    );

};

