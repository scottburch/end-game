import * as React from "react";
import {pistolLogin, usePistolAuth} from "@scottburch/pistol";
import {LinkTo} from "../components/LinkTo";
import {useEffect} from "react";
import {useNavigate} from "react-router";

export const LoginPage: React.FC = () => {
    const auth = usePistolAuth();
    const navigate = useNavigate();

    let username = '';
    let password = '';

    useEffect(() => {
        auth.pubKey && navigate('/')
    }, [auth])

    const doAuth = () => pistolLogin(username, password).subscribe();


    const keyUp = (code: string) => code === 'Enter' && doAuth();

    return (
        <div style={{paddingLeft: '20%', paddingRight:'20%'}}>
        <h3>Login:</h3>
            <input style={{width: '100%', marginBottom: 5}} autoFocus onBlur={ev => username = ev.target.value} data-lpignore="true"  onKeyUp={ev => keyUp(ev.code)}
                   placeholder="Username"/>
            <input style={{width: '100%', marginBottom: 5}} type="password" onBlur={ev => password = ev.target.value} data-lpignore="true"  onKeyUp={ev => keyUp(ev.code)}
                   placeholder="Password"/>
        <div>
            <button onClick={doAuth}>Login</button>
        </div>
    </div>
    );
};
