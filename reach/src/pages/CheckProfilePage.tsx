import {useUserProfile} from "../services/userService.js";
import {pistolLogout, usePistolAuth} from "@scottburch/pistol";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {firstValueFrom, tap} from "rxjs";

export const CheckProfilePage: React.FC = () => {
    const auth = usePistolAuth();
    const profile = useUserProfile(auth.pubKeyHex);
    const navigate = useNavigate();

    useEffect(() => {
        profile.displayName && setTimeout(() => navigate('/'))
    }, [profile.displayName])

    useEffect(() => {
        const timer = setTimeout(() => {
            firstValueFrom(pistolLogout().pipe(
                tap(() => navigate('/login-failed'))
            ))
        }, 2000);
        return () => clearTimeout(timer);
    }, [])

    return (
        <>Please Wait...</>
    )
}