import * as React from "react";
import {SendMessageBox} from "../components/SendMessageBox";
import {MessageList} from "../components/MessageList";
import {chatPath} from "../constants";

export const MessagesPage: React.FC = () => (
    <>
        <SendMessageBox/>
        <hr/>
        <MessageList base={chatPath()}/>
    </>
)
