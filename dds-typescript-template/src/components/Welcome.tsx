import {usePistolAuth} from "@scottburch/pistol";

export const Welcome: React.FC = () => {
    const auth = usePistolAuth();

    return (
        <h4>Welcome {auth.username}</h4>
    )
}