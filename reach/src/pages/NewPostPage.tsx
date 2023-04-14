import {CenterWrapper} from "../components/CenterWrapper.js";
import {Alert, Button, Form} from "antd";
import {tagSearch, writePost} from "../services/postService.js";
import {useNavigate} from "react-router-dom";
import {catchError, first, firstValueFrom, from, map, of, switchMap, tap, toArray} from "rxjs";
import {useState} from "react";
import {DataFunc, Mention, MentionsInput} from "react-mentions";
import mentionsStyle from './mentionsStyle.js';
import {nicknameSearch} from "../services/userService.js";
import {fixupMentions} from "../services/userUtils.js";


export const NewPostPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [posting, setPosting] = useState(false);

    const doPost = ({text}: {text: string}) => {
        setError('');
        setPosting(true);
        firstValueFrom(of(text).pipe(
            map(fixupMentions),
            switchMap(text => writePost({text})),
            tap(() => setTimeout(() => navigate('/my-posts'))),
            catchError(err => err.code === 'NICKNAME_NOT_FOUND' ? (
                of(`Nickname not found: ${err.nickname}`).pipe(tap(setError))
            ):(
                of(err.code).pipe(tap(setError))
            )),
            tap(() => setPosting(false))
        ))
    };

    const getMentionSuggestions: DataFunc = (query, callback) => {
        return firstValueFrom(nicknameSearch(query).pipe(
            first(),
            switchMap(({keys}) => from(keys)),
            map(nickname => ({id: nickname, display: `@${nickname}`})),
            toArray(),
            tap(callback)
        ))
    };

    const getTagSuggestions: DataFunc = (query, callback) => {
        return firstValueFrom(tagSearch(query).pipe(
            first(),
            switchMap(({keys}) => from(keys)),
            map(tag => ({id: tag, display: `#${tag}`})),
            toArray(),
            tap(callback)
        ))
    };

    return (
        <CenterWrapper>
            {error ? <Alert type="error" message={error} style={{marginBottom: 10}}/> : null}
            <div style={{paddingBottom: 4}}>
                Enter your message.  Type '#' for a tag and '@' for a mention.
            </div>
            <Form
                disabled={posting}
                onFinish={doPost}
                autoComplete="off"
            >
                <Form.Item
                    name="text"
                    rules={[{required: true, message: 'Please add text'}]}
                >

                    <MentionsInput style={mentionsStyle}>
                        <Mention
                            trigger="@"
                            data={getMentionSuggestions}
                        />
                        <Mention
                            trigger="#"
                            data={getTagSuggestions}

                        />
                    </MentionsInput>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        New Post
                    </Button>
                </Form.Item>
            </Form>
        </CenterWrapper>
    )
}