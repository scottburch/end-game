import {Alert, Button, Form, Input, Space} from "antd";
import {Link, useNavigate} from "react-router-dom";
import {CenterWrapper} from "../components/CenterWrapper.js";
import {User, UserProfile, signup} from "../services/userService.js";
import {firstValueFrom} from "rxjs";
import {usePistolAuth} from "@scottburch/pistol";
import {ProfileForm} from "../components/ProfileForm.js";
import {useEffect} from "react";

export const SignupPage: React.FC = () => {
    const auth = usePistolAuth();
    const navigate = useNavigate();

    useEffect(() => {
        auth.pubKeyHex && setTimeout(() => navigate('/'));
    }, [auth])

    const doSignup = (values: User & UserProfile) => {
        console.log(values);
        firstValueFrom(signup(values))
    }

    return (
        <CenterWrapper>
            <Form
                name="signup"
                onFinish={doSignup}
                autoComplete="off"
            >
                <fieldset style={{border: '1px solid #ccc', marginBottom: 10}}>
                    <Space direction="vertical">
                        <Alert type="info"
                               message="These fields are used to generate your private key.  They are not stored anywhere and therefore are not recoverable. Please remember them."/>
                        <Form.Item
                            name="username"
                            rules={[{required: true, message: 'Please provide a username'}]}
                        >
                            <Input id="username" placeholder='Username'/>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{
                                required: true, message: 'Please provide a password',
                            }]}
                        >
                            <Input.Password id="password" placeholder="Password"/>
                        </Form.Item>

                        <Form.Item
                            name="password2"
                            rules={[
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match'));
                                    },
                                })
                            ]}
                        >
                            <Input.Password id="password2" placeholder="Verify Password"/>
                        </Form.Item>
                    </Space>
                </fieldset>
                <ProfileForm/>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Signup
                    </Button>
                    <span style={{paddingLeft: 5, paddingRight: 5}}>or</span>
                    <Link to="/login">Login</Link>
                </Form.Item>
            </Form>
        </CenterWrapper>
    )
}