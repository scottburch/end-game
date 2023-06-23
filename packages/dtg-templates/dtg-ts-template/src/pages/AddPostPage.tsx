import {useGraphPut} from "@end-game/react-graph";
import type {Post} from "../types/Post.js";
import React, {useState} from 'react';
import {asNodeId} from "@end-game/graph";
import {Button, Form, Input} from "antd";
import {delay, map, of, switchMap, tap} from "rxjs";
import {useNavigate} from "react-router-dom";

export const AddPostPage: React.FC = () => {
    const graphPut = useGraphPut<Post>();
    const [savingPost, setSavingPost] = useState(false);
    const navigate = useNavigate();

    const addPost = (values: Post) => {
        setSavingPost(true);
        of(Date.now().toString()).pipe(
            map(id => asNodeId(id)),
            switchMap(id => graphPut('post', id, values)),
            tap(() => navigate('/'))
        ).subscribe();
    }

    return (
        <>
            <Form
                disabled={savingPost}
                name="add-post"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={addPost}
                autoComplete="off"
            >
                <Form.Item
                    label="Post Text"
                    name="text"
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Add Post
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}