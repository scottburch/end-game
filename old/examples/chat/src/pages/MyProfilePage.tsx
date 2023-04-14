import * as React from "react";
import {putPistolValue, usePistolAuth, usePistolValue} from "@scottburch/pistol";
import {chatPath} from "../constants";
import {map, of, switchMap, tap} from "rxjs";
import {UserProfile} from "../types";
import {useNavigate} from "react-router";

export const MyProfilePage: React.FC = () => {
    const auth = usePistolAuth();
    const profileStr = usePistolValue<string>(chatPath(`users.${auth.pubKey}`));
    const profile: UserProfile | undefined = profileStr ? JSON.parse(profileStr) : undefined;
    const navigate = useNavigate();

    let displayName = profile?.displayName || auth.username;
    let aboutMe = profile?.aboutMe;

    const doUpdate = () =>
        of<UserProfile>({displayName: displayName || '', aboutMe: aboutMe || ''}).pipe(
            map(profile => JSON.stringify(profile)),
            switchMap(profile => putPistolValue(chatPath(`users.${auth.pubKey}`), profile)),
            tap(() => navigate('/'))
        ).subscribe();


    const keyUp = (code: string) => code === 'Enter' && doUpdate();

    return (
        <div style={{paddingLeft: '20%', paddingRight:'20%'}}>
            <h3>My profile:</h3>
            <label>Display name</label>
            <input key={displayName} style={{width: '100%', marginBottom: 5}} defaultValue={displayName} autoFocus onChange={ev => displayName = ev.target.value} data-lpignore="true"  onKeyUp={ev => keyUp(ev.code)}
                   placeholder="Display name"/>
            <label>About me</label>
            <input style={{width: '100%', marginBottom: 5}} defaultValue={aboutMe} onChange={ev => aboutMe = ev.target.value} data-lpignore="true"  onKeyUp={ev => keyUp(ev.code)}
                   placeholder="About me"/>
            <div>
                <button onClick={doUpdate}>Update my profile</button>
            </div>
        </div>
    );}