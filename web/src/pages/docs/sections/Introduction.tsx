import React from "react";
import {DocsSection} from "../DocsSection.jsx";
import propertyGraph from '../property-graph.png'



export const Introduction: React.FC = () => (
    <DocsSection title="introduction" anchor="index" >
            <>
                <a id="intro"/>
                <p>
                Endgame helps you write networked P2P apps simply.
                </p>
                <ul>
                    <li>All networking is taken care of for you - no need for servers during development</li>
                    <li>Clients are nodes on the network - data is spread around the network for redundancy and resiliency</li>
                    <li>Full stack framework - get apps up and running quickly</li>
                    <li>Simple API for NodeJS/Browser and React library for Browser</li>
                    <li>Automatic indexing for searching/paging on object properties stored in DB</li>
                    <li>Provides a full property graph where nodes and edges can both contain properties</li>
                </ul>
            </>
            <h4>What is a property graph?</h4>
            <p>
                A property graph consists of nodes and edges.  Nodes contain data objects and edges are relationships between nodes.
                Edges can also contain properties that can contain information about the relationship.
            </p>
            <div style={{textAlign: 'center'}}>
                <img alt="property-graph" src={propertyGraph} style={{height: 300}}/>
            </div>
    </DocsSection>

)