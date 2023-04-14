import {usePistolAuth} from "@scottburch/pistol";
import {UserProfile, useUserProfile, writeUserProfile} from "../services/userService.js";
import {Alert, Button, Form} from "antd";
import {useNavigate} from "react-router-dom";
import {CenterWrapper} from "../components/CenterWrapper.js";
import {ProfileForm} from "../components/ProfileForm.js";
import {firstValueFrom, tap} from "rxjs";
import {useEffect, useState} from "react";

export const MyProfilePage: React.FC = () => {
    const auth = usePistolAuth();
    const profile = useUserProfile(auth.pubKeyHex);
    const navigate = useNavigate();
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        auth.pubKeyHex || setTimeout(() => navigate('/login'));
    }, [])

    const doUpdate = (values: UserProfile) => {
        setUpdated(false);
        firstValueFrom(writeUserProfile(auth.pubKeyHex, values).pipe(
            tap(() => setUpdated(true)),
        ))
    }

    return (
            <CenterWrapper>
                {updated ? (
                    <Alert type="success" message="Your profile has been updated." style={{marginBottom: 10}}/>
                ) : null}
                <Form
                    key={JSON.stringify(profile)}
                    name="profile"
                    onFinish={doUpdate}
                    autoComplete="off"
                    initialValues={profile}
                >
                    <ProfileForm/>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Profile
                        </Button>
                    </Form.Item>
                </Form>
            </CenterWrapper>
    )
}