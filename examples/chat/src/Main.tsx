import * as React from 'react';
import {Header} from "./components/Header";
import {BrowserRouter} from "react-router-dom";
import {Body} from "./Body";


export const Main: React.FC = () => (
    <BrowserRouter>
        <Header/>
        <Body/>
    </BrowserRouter>
);










