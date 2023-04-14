import {usePistolValue} from "@scottburch/pistol";
import {chatPath} from "../constants";

export const DisplayName: React.FC<{pubKey: string, defaultName: string}> = ({pubKey, defaultName = 'Unknown'}) => {
    const profileStr = usePistolValue<string>(chatPath(`users.${pubKey}`));
    const profile = profileStr ? JSON.parse(profileStr) : {}
    return <span>{profile.displayName || defaultName}</span>
}