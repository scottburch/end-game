import {Menu, MenuProps} from 'antd'
import {useNavigate} from "react-router-dom";
import {headerBgColor} from "./Header";

export const HeaderMenu: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{width: '100%'}}>
        <Menu theme="light" mode="horizontal" onSelect={selection => navigate(selection.keyPath.join('/'))}  items={items} style={{backgroundColor: headerBgColor}} />
        </div>

    )
}

const items: MenuProps['items']  = [{
    label: 'What is Pistol?',
    key: 'what-is-pistol'
}, {
    label: 'Getting Started',
    key: 'getting-started'
}, {
    label: 'Documentation',
    key: 'documentation'
},  /*{
    label: 'Using Pistol?',
    key: 'apps'
} */];



