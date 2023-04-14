import {Typography} from "antd";

export const CliDocs: React.FC = () => {
    return (
        <>
            <Typography.Title level={4}>Pistol CLI</Typography.Title>
        <Typography.Paragraph>
            The pistol CLI allows you to start a pistol node, start a pistol node that reads a value or put values into a pistol network.
        </Typography.Paragraph>
            <Typography.Title level={3}>Installation</Typography.Title>
            <Typography.Paragraph>
                The pistol CLI can be installed using npm.
                To install and use the pistol CLI, you must have NodeJS 18+ installed.
                <Typography.Text code>npm install -g @scottburch/pistol-cli</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>Once you have installed pistol cli you can type
                <Typography.Text code>pistol --help</Typography.Text>
                    to get help on the various commands.
            </Typography.Paragraph>
            <Typography.Paragraph>
                To get help on a specific command, type
                <Typography.Text code>pistol {'<command>'} --help</Typography.Text>
            </Typography.Paragraph>


        </>
    )
}