import React, {useRef} from 'react'
import {useGraphLogin, useNewAccount} from "@end-game/react-graph";
import {tap} from "rxjs";

export const LoginPanel: React.FC<{toggleSignup: () => void}> = ({toggleSignup}) => {
    const login = useGraphLogin();
    const username = useRef('');
    let password = useRef('');

    const doLogin = () =>
        login(username.current, password.current).pipe(tap(console.log)).subscribe();

    return (
        <>
            <input placeholder="username" onChange={ev => username.current = ev.target.value}/>
            <input placeholder="password" type="password" onChange={ev => password.current = ev.target.value}/>
            <button onClick={doLogin}>Login</button>
            <a href="#" onClick={toggleSignup}>or signup</a>
        </>
    )
}