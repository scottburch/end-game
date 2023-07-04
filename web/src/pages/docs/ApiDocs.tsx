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
    }],
    RangeOpts: [{
        name: 'gt',
        optional: true,
        type: 'string',
        description: '> value'
    }, {
        name: 'gte',
        optional: true,
        type: 'string',
        description: '>= value'
    }, {
        name: 'lt',
        optional: true,
        type: 'string',
        description: '< value'
    }, {
        name: 'lte',
        optional: true,
        type: 'string',
        description: '<= value'
    }, {
        name: 'reverse',
        optional: true,
        type: 'boolean',
        description: 'reverse results'
    }, {
        name: 'limit',
        optional: true,
        type: 'number',
        description: 'limit the number of results'
    }],
    Relationship: [{
        name: 'from',
        type: 'NodeId',
        optional: false,
        description: 'From node of relationship'
    }, {
        name: 'to',
        type: 'NodeId',
        optional: false,
        description: 'To node of relationship'
    }, {
        name: 'edgeId',
        type: 'EdgeId',
        optional: false,
        description: 'Id of edge for relationship'
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
    method: 'getNode',
    description: 'get a node from the graph by ID',
    args: [{
        name: 'graph',
        optional: false,
        type: 'Graph',
        description: 'the graph to get the node from'
    }, {
        name: 'nodeId',
        optional: false,
        type: 'NodeId',
        description: 'Id of node to get from the graph'
    }, {
        name: 'opts',
        optional: false,
        type: '{local: boolean}',
        description: 'Restrict retrieval to local host only.'
    }],
    returns: '{graph: Graph, nodeId: NodeId, node: GraphNode}'
}, {
    method: 'newEdge',
    description: 'Creates a new graph edge',
    args: [{
        name: 'edgeId',
        optional: false,
        type: 'EdgeId',
        description: <>Edge id.  Use <code>asEdgeId('my-edge-id')</code> to create a new edge id.</>
    }, {
        name: 'rel',
        optional: false,
        type: 'string',
        description: 'The name of the relationship eg. "is_friend"'
    }, {
        name: 'from',
        optional: false,
        type: 'NodeId',
        description: 'The node ID for the from node'
    }, {
        name: 'to',
        optional: false,
        type: 'NodeId',
        description: 'The node ID for the to node'
    }, {
        name: 'props',
        optional: false,
        type: 'Object',
        description: 'Properties to be stored in the edge'
    }],
    returns: '{graph: Graph, edgeId: EdgeId}'
}, {
    method: 'putEdge',
    description: 'Put an edge into the graph',
    args: [{
        name: 'graph',
        optional: false,
        type: 'Graph',
        description: 'graph to put the edge into'
    }, {
        name: 'edge',
        optional: false,
        type: 'GraphEdge',
        description: 'Edge to insert into the graph'
    }],
    returns: '{graph: Graph, edgeId: EdgeId}'
}, {
    method: 'getEdge',
    description: 'get an edge from the graph by ID',
    args: [{
        name: 'graph',
        optional: false,
        type: 'Graph',
        description: 'the graph to get the edge from'
    }, {
        name: 'edgeId',
        optional: false,
        type: 'EdgeId',
        description: 'Id of edge to get from the graph'
    }, {
        name: 'opts',
        optional: false,
        type: '{local: boolean}',
        description: 'Restrict retrieval to local host only.'
    }],
    returns: '{graph: Graph, edgeId: EdgeId, edge: GraphEdge}'
}, {
    method: 'nodesByLabel',
    description: 'retrieve nodes with a provided label',
    args: [{
        name: 'graph',
        type: 'Graph',
        optional: false,
        description: 'graph to retrieve nodes from'
    }, {
        name: 'label',
        type: 'string',
        optional: false,
        description: 'label of nodes to retrieve'
    }, {
        name: 'opts',
        type: 'RangeOpts',
        optional: true,
        description: 'range criteria of results to retrieve'
    }],
    returns: '{graph: Graph, label: string, nodes: GraphNode[], opts: RangeOpts}'
}, {
    method: 'getRelationships',
    description: 'get relationships from the graph',
    args: [{
        name: 'graph',
        optional: false,
        type: 'Graph',
        description: 'Graph to get the relationships from'
    }, {
        name: 'nodeId',
        optional: false,
        type: 'NodeId',
        description: 'Id of node to get relationships for'
    }, {
        name: 'rel',
        optional: false,
        type: 'string',
        description: 'Relationship type'
    }, {
        name: 'opts',
        optional: false,
        type: '{reverse: boolean}',
        description: 'reverse = reverse the relationship. Provide relationships to this node instead of from this node'
    }],
    returns: '{graph: Graph, nodeId: NodeId, rel: string, relationships: Relationship[]}'
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
