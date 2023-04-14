import * as React from "react";
import {useState} from "react";
import {putPistolValue, usePistolAuth} from "@scottburch/pistol";
import {filter, of, switchMap, from, mergeMap, tap, map} from "rxjs";
import {chatPath} from "../constants";
import {splitTags} from "../tagUtils";

export const SendMessageBox: React.FC = () => {
    const [text, setText] = useState('');
    const auth = usePistolAuth();

    const sendText = () => {
        const now = Date.now();
        of(true).pipe(
            filter(() => text.length > 0),
            switchMap(() => putPistolValue(chatPath(`messages.${now}`), JSON.stringify({
                text: text,
                owner: auth.pubKey
            }))),
            switchMap(() => putPistolValue(chatPath(`user.${auth.pubKey}.messages.${now}`), 'x')),
            switchMap(() => of(splitTags(text))),
            switchMap(({tags}) => from(tags)),
            map(tag => tag.replace('#', '')),
            mergeMap(tag => putPistolValue(chatPath(`tags.${tag}.messages.${now}`), 'x').pipe(map(() => tag))),
            // TODO: This is here since values are just keys with primitaves, it does not see the object, so this will notify of the tag
            mergeMap(tag => putPistolValue(chatPath(`tags.${tag}`), 'x'))
        ).subscribe();
        setText('');
    };


    const keyUp = (code: string) => code === 'Enter' && sendText()

    return <>
        <div style={{display: 'flex'}}>
            <input autoFocus style={{width: '100%', flex: 1}} onChange={ev => setText(ev.target.value)}
                   onKeyUp={ev => keyUp(ev.code)} value={text} placeholder="Type Message"/>
            <button onClick={sendText}>Send</button>
        </div>
    </>;
};
