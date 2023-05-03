import React from 'react';
import {Header} from "./components/header/Header.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomePage} from "./pages/HomePage.jsx";
import {GettingStarted} from "./pages/GettingStarted.jsx";


export const Main: React.FC = () => {
    return (
        <div style={{height: '100%'}}>
            <BrowserRouter>
                <Header/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/getting-started" element={<GettingStarted/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
};



