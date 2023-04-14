import {Layout as AntLayout} from 'antd'

import {Header} from "./Header.js";
import {MenuDrawer} from "./MenuDrawer.js";
import {MainContent} from "./MainContent.js";

export const Layout: React.FC = () => {

    return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{backgroundColor: '#eee', position: 'fixed', width: '100%', zIndex: 999}}>
            <Header/>
        </div>
        <div style={{display: 'flex', flex: 1}}>
            <AntLayout.Sider width={'auto'} style={{width: 'auto'}}>
                <MenuDrawer/>
            </AntLayout.Sider>
            <div style={{flex: 1, paddingTop:50, paddingBottom: 10}}><MainContent/></div>
        </div>
    </div>
)
}