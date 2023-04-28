import {UserProfile, useUserProfile} from "../services/userService.js";
import {Card, Spin} from "antd";
import {Link} from "react-router-dom";



export const UserProfilePane: React.FC<{owner: string}> = ({owner}) => {
    const profile = useUserProfile(owner);

    return profile.displayName ? (
        <Card title={<ProfileTitle profile={profile} />}>
            <div>@{profile.nickname}</div>
                {profile.aboutMe}
        </Card>
        ) : (
        <Spin>
            Loading...
        </Spin>
    );
}

const ProfileTitle: React.FC<{profile: UserProfile}> = ({profile}) => (
    <div style={{display: 'flex'}}>
        <div style={{flex: 1}}>{profile.displayName}</div>
        <div><Link to={`/posts/${profile.owner}`}>Messages</Link></div>
    </div>
);