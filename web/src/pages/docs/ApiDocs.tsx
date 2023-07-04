import React, {CSSProperties, ReactElement} from "react";
import {DocsSection} from "./DocsSection.jsx";

export type ApiType = {
    name: string,
    type: string,
    optional: boolean,
    description: string | ReactElement
}

export type ApiDocFn = {
    method: string,
    description: string,
    args: ApiType[],
    returns: string
}

const typesTable: Record<string, ApiType[]> = {
    GraphOpts: [{
        name: 'graphId',
        optional: false,
        type: 'GraphId',
        description: <>The id associated with this graph - create with <code>asGraphId(id: string)</code></>
    }, {
        name: 'logLevel',
        optional: true,
        type: 'LogLevel',
        description: 'The log level for this graph'
    }]
}

export const getApiDocItems = () => [{
    method: 'graphOpen',
    description: 'opens a graph for reading and writing',
    args: [{
        name: 'opts',
        optional: false,
        type: 'GraphOpts',
        description: ''
    }],
    returns: 'Graph'
}, {
    method: 'newNode',
    description: 'creates a new node object',
    args: [{
        name: 'nodeId',
        optional: false,
        type: 'NodeId',
        description: <>use <code>asNodeId('your-nodeId')</code> to create a NodeId</>
    }, {
        name: 'label',
        optional: false,
        type: 'string',
        description: 'The label ',
    }, {
        name: 'props',
        optional: false,
        type: 'Object',
        description: <></>
    }],
    returns: 'GraphNode'
}, {
    method: 'putNode',
    description: 'put a node in the graph',
    args: [{
        name: 'graph',
        optional: false,
        type: 'Graph',
        description: 'the graph to insert the node into'
    }, {
        name: 'node',
        optional: false,
        type: 'GraphNode',
        description: 'The node to insert',
    }],
    returns: '{graph: Graph, nodeId: NodeId}'
}, {
    method: 'newEdge',
    description: 'Creates a new graph edge',
    args: [],
    returns: '{graph: Graph, edgeId: EdgeId}'
}] satisfies ApiDocFn[];


export const ApiDocs: React.FC = () => (
    <DocsSection title="Graph API" anchor="graph-api">
        <>
            {getApiDocItems().map(item => (
                <div key={item.method} style={{marginBottom: 50}}>
                    <a id={`api-${item.method}`}/>
                    <h4 key={item.method}>{item.method}({fnArgs(item.args)})</h4>
                    <div style={{paddingLeft: 50}}>
                        {item.description}
                        <div style={{marginBottom: 10}}>{typeTable('args', item.args)}</div>
                        <div style={{marginBottom: 10}}>{typeTables(item)}</div>
                        <div><strong>Returns:</strong> {item.returns}</div>
                    </div>
                </div>
            ))}
        </>
    </DocsSection>
)

const typeTables = (item: ApiDocFn) => item.args.map(arg => typesTable[arg.type] ? typeTable(arg.type, typesTable[arg.type]) : null)


const fnArgs = (args: ApiDocFn['args']) => {
    return args.map(arg => `${arg.name}${arg.optional ? '?' : ''}: ${arg.type}`).join(', ');
}

const typeTable = (type: string, types: ApiType[]) => (
    <div key={type}>
        <h4>{type}</h4>
    <table style={{border: '1px solid black', borderCollapse: 'collapse'}}>
        <thead>
        <tr>
            <th style={tableCellStyle}>Prop</th>
            <th style={tableCellStyle}>Type</th>
            <th style={tableCellStyle}>Required</th>
            <th style={tableCellStyle}>Description</th>
        </tr>
        </thead>
        <tbody>
        {types.map(type => (
            <tr key={type.name}>
                <td style={tableCellStyle}>{type.name}</td>
                <td style={tableCellStyle}>{type.type.toString()}</td>
                <td style={tableCellStyle}>{type.optional ? 'No' : 'Yes'}</td>
                <td style={tableCellStyle}>{type.description}</td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
)

const tableCellStyle: CSSProperties = {border: '1px solid black', borderCollapse: 'collapse', paddingLeft: 5, paddingRight: 5}
