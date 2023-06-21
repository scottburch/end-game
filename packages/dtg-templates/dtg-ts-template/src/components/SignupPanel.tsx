import React from 'react'
import {useGraphLogin, useGraphPut, useNewAccount} from "@end-game/react-graph";
import {map, switchMap, tap} from "rxjs";
import {User} from "../types/User.js";
import {asNodeId} from "@end-game/graph";
import {Button, Form, Input} from "antd";


export const SignupPanel: React.FC = () => {
    const putNode = useGraphPut();
    const login = useGraphLogin();
    const newAccount = useNewAccount();

    const doSignup = (values: any) =>
        newAccount(values.username, values.password).pipe(
            switchMap(({nodeId: authId}) => login(values.username, values.password).pipe(
                map(() => authId)
            )),
            switchMap(authId => putNode('user', asNodeId(''), {
                display: values.displayName,
                aboutMe: values.aboutMe,
                ownerId: authId
            } satisfies User)),
            tap(() => console.log('signed up'))
        ).subscribe();


    return (
            <Form
                name="signup"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={doSignup}
                autoComplete="off"
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                        {required: true, message: 'Please input your username'},
                        {min: 4, message: 'Must be at least 4 characters'}
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {required: true, message: 'Please input your password'},
                        {min: 5, message: 'Password must be at least 5 characters'}
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    label="Confirm Password"
                    name="password2"
                    dependencies={['password']}
                    rules={[({getFieldValue}) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Password does not match'));
                        },
                    })]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    label="Display Name"
                    name="displayName"
                    rules={[
                        {required: true, message: 'Please enter a display name'}
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="About Me"
                    name="aboutMe"
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Signup
                    </Button>
                </Form.Item>
            </Form>
    )
}

