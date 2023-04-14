import {MessageList} from "../components/MessageList";
import {useParams} from "react-router";
import {chatPath} from "../constants";

export const UserMessagesPage: React.FC = () => {
    const params = useParams()

    return (
        <MessageList base={chatPath(`user.${params.id}`)}/>
    )
}