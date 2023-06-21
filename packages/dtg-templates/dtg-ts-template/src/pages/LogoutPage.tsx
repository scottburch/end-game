import React, {useEffect} from "react";
import {useGraphLogout} from "@end-game/react-graph";

export const LogoutPage:React.FC = () => {
    const logout = useGraphLogout();

    useEffect(() => {logout().subscribe()}, [])


    return (
        <h3>Loggout out...</h3>
    )
}