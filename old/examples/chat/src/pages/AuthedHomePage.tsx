import {Route, useLocation, useNavigate} from "react-router";
import {Routes} from "react-router-dom";

import {ProfilePage} from "./ProfilePage";
import {MyProfilePage} from "./MyProfilePage";
import {UserMessagesPage} from "./UserMessagesPage";
import * as React from "react";
import {MessagesPage} from "./MessagesPage";
import {usePistolAuth, usePistolValue} from "@scottburch/pistol";
import {useEffect} from "react";
import {chatPath} from "../constants";
import {UserProfile} from "../types.js";
import {TagMessagesPage} from "./TagMessagesPage";

export const AuthedHomePage: React.FC = () => {
    const auth = usePistolAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const profileStr = usePistolValue<string>(chatPath(`users.${auth.pubKey}`));
    const profile: UserProfile | undefined = profileStr ? JSON.parse(profileStr) : undefined;

    useEffect(() => {
        location.pathname === '/login' && auth.pubKey && navigate('/');
        location.pathname !== '/my-profile' && !profile?.aboutMe && navigate('/my-profile');
    })

    return (
    <Routes>
        <Route path="/" element={<MessagesPage/>}/>
        <Route path="/profile/:id" element={<ProfilePage/>}/>
        <Route path="/my-profile" element={<MyProfilePage/>}/>
        <Route path="/user/messages/:id" element={<UserMessagesPage/>} />
        <Route path="/tag/messages/:tag" element={<TagMessagesPage/>} />
    </Routes>
    )

}