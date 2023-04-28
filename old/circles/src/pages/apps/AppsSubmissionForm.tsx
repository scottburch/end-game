import {Alert, App, Button, Form, Input} from "antd";
import {putPistolValue, textToBytes, usePistolAuth} from "@scottburch/pistol";
import {useForm} from "antd/es/form/Form";
import {bytesToHex } from "@scottburch/pistol";
import {map, of, switchMap, tap} from "rxjs";

export const AppsSubmissionForm: React.FC = () => {
    const auth = usePistolAuth();
    const [form] = useForm();
    const {notification} = App.useApp();

    const onFinishFailed = () => {
    }
    const onFinish = ({url, description}: {url: string, description: string}) =>
        of(url).pipe(
            map(textToBytes),
            map(bytesToHex),
            switchMap(hash => putPistolValue(`circles-web.app-submit.${hash}`, JSON.stringify({url, description}))),
            tap(() => showAddedNotification()),
            tap(() => form.resetFields())
        ).subscribe()


    const showAddedNotification = () => {
        console.log(notification)
        notification.success({
            message: `Your application has been submitted`,
            description: 'We will review and include it in the list soon',
            placement: 'topLeft',
        });
    };

    return (
        <>
            {auth.pubKey ? null : <Alert message="Please login to submit an application" type="warning"/>}
            <Form
                form={form}
                labelCol={{span: 8}}
                name="basic"
                style={{maxWidth: 600, display: "block"}}
                initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                disabled={!auth.pubKey}

            >
                <Form.Item
                    label="Url"
                    name="url"
                    rules={[{
                        required: true, message: 'Please provide a url'
                    }, {
                        type: "url", message: 'Please provide a valid URL'
                    }]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{required: true, message: 'Please provide a description'}]}
                >
                    <Input.TextArea/>
                </Form.Item>
                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit">
                        Submit application for review
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}