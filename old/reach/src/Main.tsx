import React from 'react';
import {Layout} from "./components/Layout.js";
import {BrowserRouter} from "react-router-dom";



export const Main: React.FC = () => (
    <BrowserRouter>
        <Layout/>
    </BrowserRouter>
)
