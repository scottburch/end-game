import React, {useRef} from 'react'
import {useGraphLogin} from "@end-game/react-graph";
import {tap} from "rxjs";
import {InputField} from "./InputField.jsx";

export const LoginPanel: React.FC<{toggleSignup: () => void}> = ({toggleSignup}) => {
    const login = useGraphLogin();
    const username = useRef('');
    let password = useRef('');

    const doLogin = () =>
        login(username.current, password.current).pipe(tap(console.log)).subscribe();

    return (
        <>
            <InputField name="username" placeholder="username" onChange={v => username.current = v}/>
            <InputField name="password" placeholder="password" type="password" onChange={v => password.current = v}/>
            <button onClick={doLogin}>Login</button>
            <a style={{paddingLeft: 10}} href="#" onClick={toggleSignup}>or signup</a>
        </>
    )
}