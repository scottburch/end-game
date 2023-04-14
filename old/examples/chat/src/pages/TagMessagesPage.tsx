import {MessageList} from "../components/MessageList";
import {useParams} from "react-router";
import {chatPath} from "../constants";

export const TagMessagesPage: React.FC = () => {
    const params = useParams()

    return (
        <MessageList key={params.tag} base={chatPath(`tags.${params.tag}`)}/>
    )
}