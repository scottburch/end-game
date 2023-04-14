import * as React from "react";
import {putPistolValue, usePistolValue} from "@scottburch/pistol";
import {useState} from "react";
import {LinkTo} from "./LinkTo";
import {chatPath} from "../constants";
import {DisplayName} from "./DisplayName";
import {MessageBody} from "./MessageBody";

export const MessageItem: React.FC<{ time: string }> = ({time}) => {
    const strData = usePistolValue<string>(chatPath(`messages.${time}`));
    const data = strData ? JSON.parse(strData) : {};
    const [editMode, setEditMode] = useState(false);

    const updateText = (text: string) => {
        putPistolValue(chatPath(`messages.${time}`), JSON.stringify({...data, text})).subscribe();
        setEditMode(false);
    }

    return <div style={{border: '1px solid #888', display: "flex", padding: 5}}>
        <div style={{flex: 1}}>
            <strong>
                <LinkTo to={`/user/messages/${data.owner}`}>
                    {data.owner ? <DisplayName pubKey={data.owner} defaultName="Loading..." /> : '...Loading'}
                </LinkTo>
            </strong>
            <LinkTo style={{marginLeft: 10}} to={`/profile/${data.owner}`}>profile</LinkTo>
            <div>
                {editMode ?
                    <input defaultValue={data.text} onBlur={ev => updateText(ev.target.value)}/> : <MessageBody body={data.text} id={time}/>}
            </div>
        </div>
        <div>
            {new Date(parseInt(time)).toLocaleString()}
            <div style={{textAlign: 'right'}}>
                <button onClick={() => setEditMode(true)}>Edit</button>
            </div>
        </div>
    </div>;
};


