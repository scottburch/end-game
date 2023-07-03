import React from "react";
import {DocsSection} from "./DocsSection.jsx";

export type ApiDocFn = {
    method: string,
    args: {
       name: string,
       type: string | ApiDocFn['args'],
       optional: boolean
    }[]
}

export const getApiDocItems = () => [{
    method: 'graphOpen',
    args: [{
        name: 'opts',
        optional: false,
        type: [{
            name: 'graphId',
            optional: false,
            type: 'GraphId'
        }]
    }]
}] satisfies ApiDocFn[];



export const ApiDocs: React.FC = () => (
    <DocsSection title="Graph API" anchor="graph-api">
    <>{getApiDocItems().map(item => {return (
        <h4 key={item.method}>{item.method}({fnArgs(item.args)})</h4>
    )})}</>
    </DocsSection>
)



const fnArgs = (args: ApiDocFn['args']) => {
    return args.map(arg => `${arg.name}: ${Array.isArray(arg.type) ? objectArg(arg.type) : arg.type}`).join(', ');

    function objectArg(args: ApiDocFn['args']): string {
        return `{${fnArgs(args)}}`
    }
}
