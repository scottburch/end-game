import React from 'react';
import {BrowserRouter, Routes} from 'react-router-dom'
import {App, ConfigProvider, Layout} from "antd";
import {Route} from "react-router";
import {AppsPage} from "./pages/apps/AppsPage";
import {Header} from "./components/header/Header";
import {LoginPage} from "./pages/LoginPage";
import {WhatIsPistol} from "./pages/WhatIsPistol";
import {GettingStartedPage} from "./pages/GettingStartedPage";
import {DocumentationPage} from "./pages/DocumentationPage";


export const Main = () => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#00b96b',
                }
            }}
        >
        <App>

        <BrowserRouter>
                <Layout style={{minHeight: '100%'}}>
                    <Layout.Header style={{height: 'auto', padding: 0}}><Header/></Layout.Header>
                    <Layout.Content style={{padding: 10}}>
                        <Routes>
                            <Route path="/apps" element={<AppsPage/>}/>
                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/getting-started" element={<GettingStartedPage/>}/>
                            <Route path="/documentation/*" element={<DocumentationPage/>}/>
                            <Route path="/" element={<WhatIsPistol/>}/>
                            <Route path="/what-is-pistol" element={<WhatIsPistol/>}/>
                        </Routes>
                    </Layout.Content>
                </Layout>
        </BrowserRouter>
        </App>
        </ConfigProvider>
    );
};


