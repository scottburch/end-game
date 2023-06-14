import React, {useState} from 'react'
import {useGraphLogin, useGraphPut, useNewAccount} from "@end-game/react-graph";
import {map, switchMap, tap} from "rxjs";
import {User} from "../types/User.js";
import {InputField} from "./InputField.jsx";
import {asNodeId} from "@end-game/graph";

export const SignupPanel: React.FC<{toggleSignup: () => void}> = ({toggleSignup}) => {
    const putNode = useGraphPut();
    const login = useGraphLogin();

    const [values, setValues] = useState({
        username: '',
        password: '',
        display: '',
        aboutMe: ''
    });
    const newAccount = useNewAccount();

    const signup = () =>
        newAccount(values.username, values.password).pipe(
            switchMap(({nodeId: authId}) => login(values.username, values.password).pipe(
                map(() => authId)
            )),
            switchMap(authId => putNode('user', asNodeId(''), {
                display: values.display,
                aboutMe: values.aboutMe,
                ownerId: authId
            } satisfies User)),
            tap(() => console.log('signed up'))
        ).subscribe();


    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <InputField placeholder="Username" name="username" onChange={username => setValues({...values, username})}/>
            <InputField placeholder="Password" name="password" onChange={password => setValues({...values, password})}/>
            <InputField placeholder="Display name" name="display" onChange={display => setValues({...values, display})}/>
            <textarea id="about-me" style={{width: '100%'}} placeholder="About me" onBlur={ev => setValues({...values, aboutMe: ev.target.value})}/>
            <div style={{display: 'flex'}}>
                <button style={{width: 'fit-content'}} onClick={signup}>Signup</button>
                <a style={{paddingLeft: 10}} href="#" onClick={toggleSignup}>or login</a>
            </div>
        </div>
    )
}

