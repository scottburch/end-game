import {CenterWrapper} from "../components/CenterWrapper.js";
import {UserProfilePane} from "../panels/UserProfilePane.js";

export const UserProfilePage: React.FC<{ owner: string }> = ({owner}) => (
        <CenterWrapper>
            <UserProfilePane key={owner} owner={owner}/>
        </CenterWrapper>
)