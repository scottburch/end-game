import * as React from 'react'
import {CSSProperties, useEffect} from 'react';
import {useAuth} from "@end-game/react-graph";
import {Header} from "./components/Header.jsx";
import {Route, Routes} from "react-router-dom";
import {LoginPanel} from "./components/LoginPanel.jsx";
import {SignupPanel} from "./components/SignupPanel.jsx";
import {useLocation, useNavigate} from "react-router-dom";

export const Main: React.FC = () => {
    const auth = useAuth();
    const location = useLocation();
    const goto = useNavigate()

    useEffect(() => {
        auth.username && location.pathname.includes('login') && goto('/');
        auth.username && location.pathname.includes('signup') && goto('/');
    })

    return (
            <div style={styles.main}>
                <Header/>
                <div style={{padding: 30, textAlign: 'center'}}>
                    <Routes>
                        <Route path="/login" element={<LoginPanel/>}/>
                        <Route path="/signup" element={<SignupPanel/>}/>
                    </Routes>
                </div>
            </div>
    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#eee',
        height: '100%',
    }
}


