import {UserMentions} from "../panels/UserMentions.js";
import {CenterWrapper} from "../components/CenterWrapper.js";
import {usePistolAuth} from "@scottburch/pistol";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export const MyMentionsPage = () => {
    const auth = usePistolAuth();
    const navigate = useNavigate();

    useEffect(() => {
        auth.pubKeyHex || setTimeout(() => navigate('/'))
    }, [])

    return auth.pubKeyHex ? (
        <CenterWrapper><UserMentions pubKey={auth.pubKeyHex}/></CenterWrapper>
    ) : null
}