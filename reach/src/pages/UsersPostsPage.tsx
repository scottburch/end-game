import {PostList} from "../components/PostList.js";
import {CenterWrapper} from "../components/CenterWrapper.js";
import {userKey} from "../services/userService.js";

export const UsersPostsPage: React.FC<{owner: string}> = ({owner}) =>
    <CenterWrapper>
        <PostList base={userKey(owner, 'posts')}/>
    </CenterWrapper>;
