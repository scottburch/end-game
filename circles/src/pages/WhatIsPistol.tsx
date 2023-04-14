import {Typography} from "antd";
import {PistolIntroVideo} from "../pistol-intro-carousel/PistolIntroVideo";

export const WhatIsPistol: React.FC = () => {
    return (
        <div style={{display: "flex", alignItems: 'center'}}>
            <div style={{flex: 1}}/>
            <Typography>
                <Typography.Title>What is Pistol?</Typography.Title>
                <Typography.Paragraph>Pistol is a rapid development framework built on top of Circles DDS to easily
                    create peer-to-peer multi-user applications.</Typography.Paragraph>
                <Typography.Paragraph>Pistol allows developers to create client-side applications that network together
                    quickly and easily.
                    <Typography.Text strong>No server side code is needed.</Typography.Text>
                </Typography.Paragraph>
                <Typography.Paragraph style={{display: 'flex'}}>
                    <div style={{minWidth: 300}}>
                        <Typography.Title level={3}>Pistol is perfect for:</Typography.Title>
                        <ul>
                            <li>Multiplayer gaming</li>
                            <li>Rapid development</li>
                            <li>Prototyping</li>
                            <li>Mobile offline-first development</li>
                            <li>Internet of things</li>
                            <li>Censorship resistance</li>
                        </ul>
                    </div>
                    <div style={{flex: 1}}>
                        <PistolIntroVideo/>
                    </div>

                </Typography.Paragraph>
            </Typography>
            <div style={{flex: 1}}/>
        </div>
    )
}