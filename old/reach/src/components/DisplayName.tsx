import {useUserProfile} from "../services/userService.js";
import {Link} from "react-router-dom";

export const DisplayName: React.FC<{owner: string}> = ({owner}) => {
    const {displayName} = useUserProfile(owner);
    return <Link to={`/user/profile/${owner}`}>{displayName}</Link>
};