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
import {PostsByTagPage} from "./pages/PostsByTagPage.jsx";
import {Layout} from "antd";
import {PostsByOwnerPage} from "./pages/postsByOwnerPage.jsx";

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
            <Layout style={{height: '100%'}}>
                <Layout.Header style={styles.header}>
                    <Header/>
                </Layout.Header>
                <Layout.Content id="body" style={{padding: 30, height: 'calc(100% - 50px)', overflow: 'auto'}}>
                    <Routes>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/signup" element={<SignupPage/>}/>
                        <Route path="/logout" element={<LogoutPage/>}/>
                        <Route path="/my-profile" element={<MyProfilePage/>}/>
                        <Route path="/profile/:userId" element={<ProfilePage/>}/>
                        <Route path="/add-post" element={<AddPostPage/>}/>
                        <Route path="/posts" element={<PostsPage/>}/>
                        <Route path="/posts/tag/:tag" element={<PostsByTagPage/>}/>
                        <Route path="/posts/owner/:owner" element={<PostsByOwnerPage/>}/>
                        <Route path="/" element={<PostsPage/>}/>
                    </Routes>
                </Layout.Content>
            </Layout>
    );
};

const styles: Record<'header', CSSProperties> = {
    header: {
        display: 'flex',
        background: '#0057df',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1}
}


