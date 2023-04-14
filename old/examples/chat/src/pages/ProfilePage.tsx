import {useNavigate, useParams} from "react-router";
import {usePistolValue} from "@scottburch/pistol";
import {chatPath} from "../constants";
import {UserProfile} from "../types";

export const ProfilePage: React.FC = () => {
    const params = useParams();
    const profileStr = usePistolValue<string>(chatPath(`users.${params.id}`));
    const profile: UserProfile | undefined = profileStr ? JSON.parse(profileStr) : {};
    const navigate = useNavigate();

    return (
        <div>
            <h3>Profile:</h3>
        <table>
            <tbody>
            <tr>
                <th style={{textAlign: 'left'}}>Display name</th>
                <td>{profile?.displayName}</td>
            </tr>
            <tr>
                <th style={{textAlign: 'left'}}>About</th>
                <td>{profile?.aboutMe}</td>
            </tr>
            </tbody>
        </table>
            <button onClick={() => navigate(`/user/messages/${params.id}`)}>Messages</button>
        </div>
    )
};