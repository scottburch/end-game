import React, {useState} from "react";
import {LoginPanel} from "./LoginPanel.jsx";
import {SignupPanel} from "./SignupPanel.jsx";

export const LoginOrSignupPanel: React.FC = () => {
    const [which, setWhich] = useState('login')
    return (<div style={{display: 'flex'}}>
            <div style={{flex: .3}}/>
            <div style={{flex: .3}}>
        {which === 'login' ?
            <LoginPanel toggleSignup={() => setWhich('signup')}/> : <SignupPanel/>}
            </div>
            <div style={{flex: .3}}/>
    </div>
    )

}