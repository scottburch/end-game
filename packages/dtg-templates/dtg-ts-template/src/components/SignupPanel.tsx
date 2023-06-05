import React, {useState} from 'react'
import {useGraphLogin, useGraphPut, useNewAccount} from "@end-game/react-graph";
import {map, switchMap, tap} from "rxjs";
import {User} from "../types/User.js";

export const SignupPanel: React.FC = () => {
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
            switchMap(authId => putNode('user', '', {
                display: values.display,
                aboutMe: values.aboutMe,
                ownerId: authId
            } satisfies User)),
            tap(() => console.log('signed up'))
        ).subscribe();


    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <Input placeholder="Username" name="username" onBlur={username => setValues({...values, username})}/>
            <Input placeholder="Password" name="password" onBlur={password => setValues({...values, password})}/>
            <Input placeholder="Display name" name="display" onBlur={display => setValues({...values, display})}/>
            <textarea id="about-me" style={{width: '100%'}} placeholder="About me" onBlur={ev => setValues({...values, aboutMe: ev.target.value})}/>
            <button style={{width: 'fit-content'}} onClick={signup}>Signup</button>
        </div>
    )
}

const Input: React.FC<{name: string, placeholder: string, onBlur: (v: string) => void}> = ({name, onBlur, placeholder}) => (
    <div style={{paddingBottom: 5}}>
        <input style={{width: '100%'}} id={name} placeholder={placeholder} onBlur={ev => onBlur(ev.target.value)}/>
    </div>
)