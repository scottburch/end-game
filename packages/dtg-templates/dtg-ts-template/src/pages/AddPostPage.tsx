import {useGraphPut, useGraphPutEdge} from "@end-game/react-graph";
import type {Post} from "../types/Post.js";
import React, {useState} from 'react';
import {asNodeId} from "@end-game/graph";
import {Button, Form, Mentions} from "antd";
import {combineLatest, from, last, map, merge, mergeMap, of, switchMap, tap, toArray} from "rxjs";
import {useNavigate} from "react-router-dom";
import {findTagsFromPost} from "../utils/postUtils.js";

export const AddPostPage: React.FC = () => {
    const graphPut = useGraphPut<Post>();
    const edgePut = useGraphPutEdge();

    const [savingPost, setSavingPost] = useState(false);
    const navigate = useNavigate();

    const addPost = (values: Omit<Post, 'timestamp'>) => {
        setSavingPost(true);
        of(Date.now().toString()).pipe(
            map(id => asNodeId(id)),
            switchMap(id => graphPut('post', id, {...values, timestamp: new Date})),
            switchMap(({nodeId}) => combineLatest([
                of(nodeId),
                findTagsFromPost(values.text)
            ])),
            switchMap(([postId, tags]) => from(tags).pipe(
                mergeMap(tag => edgePut('tag', '', postId, tag, {tag})),
                last()
            )),
            tap(() => navigate('/'))
        ).subscribe();
    }

    const loadMention = (...args: any[]) => {
        console.log(args)
    }

    return (
        <>
            <Form
                disabled={savingPost}
                name="add-post"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600, textAlign: 'left'}}
                initialValues={{remember: true}}
                onFinish={addPost}
                autoComplete="off"
            >
                <Form.Item
                    label="Post Text"
                    name="text"
                >
                    <Mentions prefix={['#', '@']} onSearch={loadMention} rows={3}/>
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

