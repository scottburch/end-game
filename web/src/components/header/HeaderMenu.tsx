import {useGraphNodesByLabel, useGraphPut} from "@end-game/react-graph";
import React, {useEffect} from "react";

import {Menu} from "antd";
import {initHeaderMenu} from "../../stores/headerMenuStore.js";

export const HeaderMenu: React.FC = () => {
    const menuItems = useGraphNodesByLabel<{key: string, label: string}>('header-menu-option');
    const put = useGraphPut();

    useEffect(() => {
        initHeaderMenu(put)
    }, []);

    const items = menuItems.map(it => it.props)

    return (
        <Menu  mode="horizontal" style={{backgroundColor: '#ab97da', width: '80%', color: 'white'}} items={items}/>
    );

};

