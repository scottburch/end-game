import React from 'react'
import {H1, H4} from '../components/htags.jsx'
import {Code} from "../components/Code.jsx";

export const GettingStarted: React.FC = () => (
    <div style={{padding: 20}}>
        <H1>Getting Started</H1>
        <p>
            The quickest way to get started is to use the Endgame CLI
        </p>
        <H4>
            Installing the endgame CLI
        </H4>
        <p>
        <Code>npm install -g @end-game/cli</Code>
        <span style={{paddingLeft: 10, paddingRight: 10}}>or</span>
        <Code>yarn global add @end-game/cli</Code>
        </p>
        <p>
            If you don't want to install the CLI, you can use npx to call it.
            <div>
                <Code>npx @end-game/cli ...</Code>
            </div>
        </p>

        <H4>
            Create your application
        </H4>
        <p>
            Once you have the CLI installed, you can create a new application.
            <div>
                <Code>endgame create-app {'<dest>'}</Code>
            </div>
        </p>
    </div>
)