import {Routes} from "react-router-dom";
import {Route, useLocation, useParams} from "react-router";
import {setMenuOpen} from "../appState.js";
import {LoginPage} from "../pages/LoginPage.js";
import {NewPostPage} from "../pages/NewPostPage.js";
import {MyPostsPage} from "../pages/MyPostsPage.js";
import {CheckProfilePage} from "../pages/CheckProfilePage.js";
import {MyProfilePage} from "../pages/MyProfilePage.js";
import {SignupPage} from "../pages/SignupPage.js";
import {UsersPostsPage} from "../pages/UsersPostsPage.js";
import {HomePage} from "../pages/HomePage.js";
import {UserProfilePage} from "../pages/UserProfilePage.js";
import {MyMentionsPage} from "../pages/MyMentionsPage.js";
import {UserProfileByNickPage} from "../pages/UserProfileByNickPage.js";
import {TagPostsPage} from "../pages/TagPostsPage.js";

export const MainContent: React.FC = () => {
    useLocation();
    setTimeout(() => setMenuOpen(false));

    return (
        <Routes>
            <Route path="/login" element={<LoginPage failed={false}/>}/>
            <Route path="/login-failed" element={<LoginPage failed={true}/>}/>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/new-post" element={<NewPostPage/>}/>
            <Route path="/my-posts" element={<MyPostsPage/>}/>
            <Route path="/my-profile" element={<MyProfilePage/>}/>
            <Route path="/check-profile" element={<CheckProfilePage/>}/>
            <Route path="/posts/:owner" element={<UsersPostWithParams/>}/>
            <Route path="/user/profile/:owner" element={<UserProfileWithParams/>}/>
            <Route path="/my-mentions" element={<MyMentionsPage/>}/>
            <Route path="/user/profile-by-nick/:nick" element={<UserProfileByNickWithParams/>}/>
            <Route path="/tag/posts/:tag" element={<TagPostsWithParams/>}/>
            <Route path="/" element={<HomePage/>}/>
        </Routes>
    )
};

const TagPostsWithParams: React.FC = () => {
    const {tag} = useParams<{tag: string}>();
    return tag ? <TagPostsPage tag={tag}/> : null
};

const UsersPostWithParams: React.FC = () => {
    const {owner} = useParams<{owner: string}>();
    return owner ? <UsersPostsPage owner={owner}/> : null
}

const UserProfileWithParams: React.FC = () => {
    const {owner} = useParams<{owner: string}>();
    return owner ? <UserProfilePage owner={owner}/> : null
}

const UserProfileByNickWithParams: React.FC = () => {
    const {nick} = useParams<{nick: string}>();
    return nick ? <UserProfileByNickPage nick={nick}/> : null
}