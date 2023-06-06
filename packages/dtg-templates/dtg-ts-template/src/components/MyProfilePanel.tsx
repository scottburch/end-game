import React, {useEffect, useState} from 'react'
import {InputField} from "./InputField.jsx";
import {useUser} from "../hooks/useUser.jsx";
import {useGraphPut} from "@end-game/react-graph";
import {User} from "../types/User.js";


export const MyProfilePanel: React.FC = () => {
    const user = useUser();
    const [values, setValues] = useState({display: user.display, aboutMe: user.aboutMe})
    const put = useGraphPut<User>()

    const updateProfile = () => {
        console.log(user.nodeId);
        put('user', user.nodeId, {ownerId: user.ownerId, ...values}).subscribe();
    }

    useEffect(() => {
        user.ownerId && setValues(user);
    }, [user])

    return (
        <div style={{display:'flex', flexDirection: 'column'}}>
            <InputField value={values.display} placeholder="Display name" name="display" onChange={display => setValues({...values, display})}/>
            <textarea id="about-me" value={values.aboutMe} placeholder="About me" onChange={ev => setValues({...values, aboutMe: ev.target.value})}/>
            <button onClick={updateProfile}>Update profile</button>
        </div>
    )
}