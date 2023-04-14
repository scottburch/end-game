import {usePistolAuth} from "@scottburch/pistol";
import {LoginControl} from "./LoginControl";

export const Welcome: React.FC = () => {
    const user = usePistolAuth();


    return (<div>
        {user.pubKey ? (
            <span>Welcome {user.username} | <a href="#" onClick={() => window.location.href='/'}>Logout</a></span>
        ) : <LoginControl/>}
    </div>)
}

