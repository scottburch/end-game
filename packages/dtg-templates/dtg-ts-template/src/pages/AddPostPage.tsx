import {useAuth, useGraph, useGraphPut} from "@end-game/react-graph";
import type {Post} from "../types/Post.js";
import React, {useState} from 'react';
import {asNodeId, nodesByProp} from "@end-game/graph";
import {Button, Form, Mentions} from "antd";
import {catchError, combineLatest, first, from, map, mergeMap, of, switchMap, tap, throwError, toArray} from "rxjs";
import {useNavigate} from "react-router-dom";
import {findTagsFromPost} from "../utils/postUtils.js";
import {MentionsOptionProps} from "antd/es/mentions/index.js";



export const AddPostPage: React.FC = () => {
    const graphPut = useGraphPut<Post | {name: string}>();
    const graph = useGraph();
    const auth = useAuth();

    const [suggestions, setSuggestions] = useState<MentionsOptionProps[]>([]);

    const [savingPost, setSavingPost] = useState(false);
    const navigate = useNavigate();

    const addPost = (values: Omit<Post, 'timestamp'>) => {
        setSavingPost(true);
        combineLatest([
            of(asNodeId(Date.now().toString())),
            findTagsFromPost(values.text),
        ]).pipe(
            switchMap(([id, tags]) => combineLatest([
                graphPut('post', id, {...values, tags, timestamp: new Date(), owner: auth.nodeId}),
                tags.length ? from(tags).pipe(
                    mergeMap(tag => graphPut('tag', '', {name: tag})),
                    catchError(err => err.code === 'UNAUTHORIZED_USER' ? of(undefined) : throwError(err))
                ) : of(undefined)
            ])),
            tap(() => navigate('/'))
        ).subscribe();
    }

    const loadSuggestions = (text: string, prefix: string) => {
        if(text.length < 2) {
            setSuggestions([]);
        } else {
            prefix === '#' ? lookupTags(text) : lookupMentions(text);
        }

        function lookupTags(text: string) {
            nodesByProp(graph, 'tag', 'name', `${text}*`).pipe(
                switchMap(({nodes}) => from(nodes).pipe(
                    map(node => node.props.name),
                    map(key => ({key, label: key, value: key})),
                    toArray()
                )),
                first(),
                tap(suggestions => setSuggestions(suggestions))
            ).subscribe();
        }
        function lookupMentions(text: string){
            nodesByProp(graph, 'user', 'nickname', `${text}*`).pipe(
                switchMap(({nodes}) => from(nodes).pipe(
                    map(node => node.props.nickname),
                    map(key => ({key, label: key, value: key})),
                    toArray()
                )),
                first(),
                tap(suggestions => setSuggestions(suggestions))
            ).subscribe()
        }
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
                    <Mentions prefix={['#', '@']} onSearch={loadSuggestions} rows={3} options={suggestions}/>
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

