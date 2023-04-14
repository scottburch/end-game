import {Link, useNavigate} from "react-router-dom";
import {CenterWrapper} from "../components/CenterWrapper.js";

export const LoginPage: React.FC<{failed: boolean}> = ({failed}) => {
    const auth = usePistolAuth();
    const navigate = useNavigate();

    useEffect(() => {
        auth.pubKeyHex && setTimeout(() => navigate('/check-profile'));
    }, [auth.pubKeyHex])

    return (
        <div style={{paddingTop:20}}>
            {failed ? (
                <div style={{paddingBottom: 20}}>
                    <Alert message={'Login Failed!'} type="error" />
                </div>
            ) : null}
            <CenterWrapper>
                <Login/>
            </CenterWrapper>
        </div>
    )
}

import {pistolLogin, usePistolAuth} from "@scottburch/pistol";
import {Alert, Button, Form, Input} from "antd";
import {useEffect} from "react";


export const Login:React.FC = () => {

    const doLogin = ({username, password}: {username: string, password: string}) => pistolLogin(username, password).subscribe();

    return (
        <Form
            name="login"
            onFinish={doLogin}
            autoComplete="off"
        >
            <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input id="username" placeholder='Username'/>
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password id="password" placeholder="Password"/>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Login
                </Button>
                <span style={{paddingLeft: 5, paddingRight: 5}}>or</span>
                <Link to="/signup">Signup</Link>
            </Form.Item>
        </Form>
    )
}