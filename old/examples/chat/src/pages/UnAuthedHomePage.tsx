import {Route, useNavigate} from "react-router";
import {useEffect} from "react";
import {LoginPage} from "./LoginPage";
import * as React from "react";
import {Routes} from "react-router-dom";

export const UnAuthedHomePage: React.FC = () => {
    const navigate = useNavigate();
    useEffect(() => navigate('/login'), []);
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
        </Routes>
    )
}