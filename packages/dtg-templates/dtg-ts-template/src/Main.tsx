import * as React from 'react'
import {CSSProperties, useEffect} from 'react';
import {useAuth} from "@end-game/react-graph";
import {Header} from "./components/Header.jsx";
import {Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.jsx";
import {SignupPage} from "./pages/SignupPage.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import {LogoutPage} from "./pages/LogoutPage.jsx";

export const Main: React.FC = () => {
    const auth = useAuth();
    const location = useLocation();
    const goto = useNavigate()

    useEffect(() => {
        auth.username && location.pathname.includes('login') && goto('/');
        auth.username && location.pathname.includes('signup') && goto('/');
        !auth.username && location.pathname.includes('logout') && goto('/');
    })

    return (
            <div style={styles.main}>
                <Header/>
                <div id="body" style={{padding: 30, textAlign: 'center'}}>
                    <Routes>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/signup" element={<SignupPage/>}/>
                        <Route path="/logout" element={<LogoutPage/>}/>
                    </Routes>
                </div>
            </div>
    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#e9ecff',
        height: '100%',
    }
}


