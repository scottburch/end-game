import {usePistolAuth} from "@scottburch/pistol";
import {UsersPostsPage} from "./UsersPostsPage.js";

export const MyPostsPage: React.FC = () => {
    const auth = usePistolAuth();

    return <UsersPostsPage owner={auth.pubKeyHex}/>
}