import {Button, Checkbox, Col, Form, Input, Row} from "antd";
import {pistolLogin, usePistolAuth} from "@scottburch/pistol";
import {useNavigate} from "react-router-dom";

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = usePistolAuth();

    auth.pubKey && setTimeout(() => navigate('/'));

    const onFinish = ({username, password, rememberMe}: { username: string, password: string, rememberMe: boolean }) =>
        pistolLogin(username, password).subscribe();
    const onFinishFailed = (v: any) => {
        console.log(v)
    }

    return (
        <Form
            labelCol={{span: 8}}
            name="basic"
            style={{maxWidth: 600, display: "block"}}
            initialValues={{remember: true}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[{required: true, message: 'Please input your username!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{required: true, message: 'Please input your password!'}]}
            >
                <Input.Password/>
            </Form.Item>
            <Col offset={7}>
                <Row>
                    <Form.Item wrapperCol={{offset: 8, span: 16}}>
                        <Button type="primary" htmlType="submit">
                            Login
                        </Button>
                    </Form.Item>
                    <Form.Item name="remember" valuePropName="checked" wrapperCol={{offset: 8, span: 16}}>
                        <Checkbox style={{whiteSpace: 'nowrap'}}>Remember me</Checkbox>
                    </Form.Item>
                </Row>
            </Col>
        </Form>
    )
}