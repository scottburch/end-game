import {Typography} from "antd";

export const GettingStartedPage: React.FC = () => {
    return (
        <Typography style={{paddingLeft: '30%', paddingRight: '30%'}}>
            <Typography.Title>Quickstart</Typography.Title>
            <Typography.Paragraph>
                You can start a DDS project very easily by using our Pistol DDS Starter Kit.
            </Typography.Paragraph>
            <Typography.Paragraph>
                To do this you will need the following installed on your computer:
                <ul>
                    <li>NodeJS 18+</li>
                    <li>Git</li>
                    <li>Yarn</li>
                </ul>

            </Typography.Paragraph>
            <Typography.Paragraph>
                Type <Typography.Text code={true}>npx create-dds-app my-app</Typography.Text> to install the default
                template.
                Follow the instructions provided after installation.
            </Typography.Paragraph>
            <Typography.Paragraph>
                This template provides a basic React app and a script to start a two node testnet you can use to play
                around or start developing your own project.
            </Typography.Paragraph>
            <div style={{display: 'flex'}}>
                <div>
                    <Typography.Paragraph>
                        <a href="https://rumble.com/v293cew-1-pistol-dds-starter-kit-install.html?mref=tundn&mc=aqzjs">
                            View install video on rumble
                        </a>
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <iframe style={{display: "block"}} src="https://rumble.com/embed/v26hf20/?pub=tundn"/>
                    </Typography.Paragraph>
                </div>
                <div>
                    <Typography.Paragraph>
                        <a href="https://rumble.com/v2ats5s-2-pistol-dds-starter-kit-code.html?mref=tundn&mc=aqzjs">
                            View code video on rumble
                        </a>
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <iframe style={{display: "block"}} src="https://rumble.com/embed/v288cbg/?pub=tundn"/>
                    </Typography.Paragraph>
                </div>
            </div>

        </Typography>
    )
}

