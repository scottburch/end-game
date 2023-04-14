import {PostList} from "../components/PostList.js";
import {CenterWrapper} from "../components/CenterWrapper.js";
import {reachPostsBase} from "../services/postService.js";

export const HomePage: React.FC = () => {
    return (
        <CenterWrapper>
            <PostList base={reachPostsBase()}/>
        </CenterWrapper>
    )
}