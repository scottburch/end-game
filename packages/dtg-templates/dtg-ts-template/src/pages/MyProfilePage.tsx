import React from 'react'
import {useUser} from "../hooks/useUser.jsx";
import {useGraphPut} from "@end-game/react-graph";
import {User} from "../types/User.js";
import {Button, Form, Input} from "antd";


export const MyProfilePage: React.FC = () => {
    const user = useUser();
    const put = useGraphPut<User>()

    const updateProfile = (values: any) => {
        put('user', user.nodeId, {ownerId: user.ownerId, ...values}).subscribe();
    }


    return (
            <Form
                key={user.display || 'empty'}
                name="my-profile"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={updateProfile}
                autoComplete="off"
            >

                <Form.Item
                    label="Display Name"
                    name="display"
                    rules={[
                        {required: true, message: 'Please enter a display name'}
                    ]}
                    initialValue={user.display}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="About Me"
                    name="aboutMe"
                    initialValue={user.aboutMe}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Update Profile
                    </Button>
                </Form.Item>
            </Form>
    )
}