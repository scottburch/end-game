import {Form, Input} from "antd";


export const ProfileForm: React.FC = () => (
    <>
        <Form.Item
            name="displayName"
            rules={[{required: true, message: 'Please provide a display name'}]}
        >
            <Input id="displayName" placeholder='Display Name'/>
        </Form.Item>

        <Form.Item
            label={<span style={{fontSize: '1.5em'}}>@</span>}
            colon={false}
            name="nickname"
            required={false}
            rules={[{
                required: true, message: 'Please provide a nickname'
            }, {
                min: 3, message: 'Please provide at least 5 characters'
            }, {
                whitespace: false, message: 'Please provide numbers and letters only'
            }, {
                pattern: /[a-z0-9]/, message: 'Please provide numbers or lower case letters only'
            }]}>
            <Input id="nickname" placeholder='Nickname'/>
        </Form.Item>

        <Form.Item
            name="aboutMe"
        >
            <Input.TextArea id="aboutMe" placeholder='About Me'/>
        </Form.Item>
    </>
)