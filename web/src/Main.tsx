import React from 'react';
import {Header} from "./components/header/Header.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomePage} from "./pages/HomePage.jsx";
import {GettingStarted} from "./pages/GettingStarted.jsx";
import {ConfigProvider} from "antd";
import {DocsIntroPage} from "./pages/docs/DocsIntroPage.jsx";
import {DocsPage} from "./pages/docs/DocsPage.jsx";
import {DocsLayout} from "./components/DocsLayout.jsx";


export const Main: React.FC = () => {
    return (
        <div style={{height: '100%'}}>
            <BrowserRouter>
                <ConfigProvider theme={{ hashed: false }}>
                        <Header/>
                        <Routes>
                            <Route path="/" element={<HomePage/>}/>
                            <Route path="/getting-started" element={<GettingStarted/>}/>
                            <Route path="/docs" element={<DocsLayout/>}>
                                <Route index element={<DocsPage/>}/>
                                <Route path="intro" element={<DocsIntroPage/>}/>
                            </Route>
                        </Routes>
                </ConfigProvider>
            </BrowserRouter>
        </div>
    );
};



