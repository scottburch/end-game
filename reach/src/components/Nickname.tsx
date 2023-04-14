import {useUserProfile} from "../services/userService.js";
import {Link} from "react-router-dom";

export const Nickname: React.FC<{owner: string}> = ({owner}) => {
    const {nickname} = useUserProfile(owner);
    return <Link to={`/user/profile/${owner}`}>@{nickname}</Link>
};