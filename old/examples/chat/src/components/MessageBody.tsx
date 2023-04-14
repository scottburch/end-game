import {splitTags} from "../tagUtils";
import {LinkTo} from "./LinkTo";

export const MessageBody: React.FC<{body: string, id: string}> = ({body, id}) => {
    const {parts, tags} = body ? splitTags(body) : {parts: [], tags: []};
    const combine = parts.flatMap((part, idx) => ([
        part,
        tags[idx] ? <LinkTo key={idx} to={`/tag/messages/${tags[idx].replace('#', '')}`}>{tags[idx]}</LinkTo> : ''
        ]))
    return (
        <div>
            {combine}
        </div>
    )
}