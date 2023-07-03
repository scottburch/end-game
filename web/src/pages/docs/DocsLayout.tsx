import React, {useEffect, useState} from 'react'
import {Outlet} from "react-router";
import {Menu, MenuProps} from "antd";

export const DocsLayout:React.FC = () => {
    const [anchor, setAnchor] = useState(location.pathname.split('#')[1] || 'intro')

    useEffect(() => {window.location.href = `#${anchor}`}, [anchor])

    return (
        <div style={{display: 'flex'}}>
            <Menu
                theme="dark"
                items={getMenuItems()}
                selectedKeys={[anchor]}
                onSelect={item => setAnchor(item.key)}
            />
            <div style={{flex: 1, padding: 5}}>
                <Outlet/>
            </div>
        </div>
    )
}

const getMenuItems = () => [{
    key: 'intro',
    label: 'Introduction'
}, {
    key: 'api',
    label: 'API',
    type: 'group',
    children: [{
        key: 'api-graph-open',
        label: 'graphOpen()'
    }],
}] satisfies MenuProps['items'];