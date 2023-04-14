import {Button} from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import {setMenuOpen, useIsMenuOpen} from "../appState.js";



export const HeaderMenuBtn: React.FC = () => {
    const open = useIsMenuOpen()
    return (
            <Button id="header-menu-btn" type="primary" onClick={() => setMenuOpen(!open)}>
                {open ?  <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </Button>
    )
}