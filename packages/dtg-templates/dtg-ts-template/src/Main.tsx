import * as React from 'react'
import {CSSProperties, useEffect} from 'react';
import {useAuth} from "@end-game/react-graph";
import {Header} from "./components/Header.jsx";
import {Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.jsx";
import {SignupPage} from "./pages/SignupPage.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import {LogoutPage} from "./pages/LogoutPage.jsx";
import {MyProfilePage} from "./pages/MyProfilePage.jsx";
import {AddPostPage} from "./pages/AddPostPage.jsx";
import {PostsPage} from "./pages/PostsPage.jsx";
import {ProfilePage} from "./pages/ProfilePage.jsx";

export const Main: React.FC = () => {
    const auth = useAuth();
    const location = useLocation();
    const goto = useNavigate()

    useEffect(() => {
        auth.username && location.pathname.includes('login') && goto('/');
        auth.username && location.pathname.includes('signup') && goto('/');
        !auth.username && location.pathname.includes('logout') && goto('/');
        !auth.username && location.pathname.includes('my-profile') && goto('/');
        !auth.username && location.pathname.includes('add-post') && goto('/');
    })

    return (
            <div style={styles.main}>
                <Header/>
                <div id="body" style={{padding: 30, textAlign: 'center'}}>
                    <Routes>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/signup" element={<SignupPage/>}/>
                        <Route path="/logout" element={<LogoutPage/>}/>
                        <Route path="/my-profile" element={<MyProfilePage/>}/>
                        <Route path="/profile/:userId" element={<ProfilePage/>}/>
                        <Route path="/add-post" element={<AddPostPage/>}/>
                        <Route path="/posts" element={<PostsPage/>}/>
                        <Route path="/" element={<PostsPage/>}/>
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


