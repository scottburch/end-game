import {PostList} from "../components/PostList.js";
import {userKey} from "../services/userService.js";

export const UserMentions: React.FC<{pubKey: string}> = ({pubKey}) => {
    return (
        <PostList base={userKey(pubKey, 'mentions')}/>
    )
}