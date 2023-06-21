import React from 'react'
import {useGraphLogin} from "@end-game/react-graph";
import {Button, Form, Input, message} from "antd";
import {tap} from "rxjs";

export const LoginPage: React.FC = () => {
    const login = useGraphLogin();

    const doLogin = (values: any) =>
        login(values.username, values.password).pipe(
            tap((x) => console.log(x)),
            tap(({graph}) => graph.user?.username || message.error('Invalid login'))
        ).subscribe();

    return (
        <Form
            name="login"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={doLogin}
            autoComplete="off"
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}

            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Login
                </Button>
            </Form.Item>
        </Form>
    )
}