import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {getOwnerFromNickname} from "../services/userService.js";
import {firstValueFrom, tap} from "rxjs";
import {Typography} from "antd";

export const UserProfileByNickPage: React.FC<{nick: string}> = ({nick}) => {
    const navigate = useNavigate();

    useEffect(() => {
        firstValueFrom(getOwnerFromNickname(nick).pipe(
            tap(({owner}) => navigate(`/user/profile/${owner}`))
        ))
    }, [])

    return <Typography.Title>Loading...</Typography.Title>
}