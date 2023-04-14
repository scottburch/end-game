import {List} from "antd";
import {Link} from "react-router-dom";
import {usePistolAuth} from "@scottburch/pistol";

export const SideMenu: React.FC = () => {
    const auth = usePistolAuth();

    return (
        <List>
            <List.Item>
                <Link to="/">Home</Link>
            </List.Item>
            {auth.pubKeyHex ? (
                <List.Item>
                    <Link to="/my-posts">My Posts</Link>
                </List.Item>
            ) : null}
            {auth.pubKeyHex ? (
                <List.Item>
                    <Link to="/new-post">New Post</Link>
                </List.Item>
            ) : null}
            {auth.pubKeyHex ? (
                <List.Item>
                    <Link to="/my-mentions">My Mentions</Link>
                </List.Item>
            ) : null}
            {auth.pubKeyHex ? (
                <List.Item>
                    <Link to="/my-profile">My Profile</Link>
                </List.Item>
            ) : null}
        </List>
    )
}



