import * as React from "react";
import {usePistolKeys} from "@scottburch/pistol";
import {MessageItem} from "./MessageItem";

export const MessageList: React.FC<{base: string}> = ({base}) => {
    const times = usePistolKeys(`${base}.messages`);
    return <>{times.sort().map(time => <MessageItem key={time} time={time}/>)}</>
};
