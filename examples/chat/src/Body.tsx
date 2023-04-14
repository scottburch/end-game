import * as React from "react";
import {usePistolAuth} from "@scottburch/pistol";
import {AuthedHomePage} from "./pages/AuthedHomePage";
import {UnAuthedHomePage} from "./pages/UnAuthedHomePage";


export const Body: React.FC = () => {
    const auth = usePistolAuth();

    return (
        <div style={{padding: 10}}>
            {auth.pubKey ? <AuthedHomePage/> : <UnAuthedHomePage/>}
        </div>
    )
};