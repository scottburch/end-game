import {CenterWrapper} from "../components/CenterWrapper.js";
import {PostList} from "../components/PostList.js";
import {tagPostIdxBase} from "../services/postService.js";

export const TagPostsPage: React.FC<{tag: string}> = ({tag}) => {
    return (
    <CenterWrapper>
        <PostList base={tagPostIdxBase(tag)}/>
    </CenterWrapper>
    )
}