import React from 'react'
import {EndgamePyramid} from "../components/EndgamePyramid.jsx";
import triangleImg from '../images/eg-triangle.svg'
import {Svg} from "../components/Svg.jsx";
import {List, Space} from "antd";
import {IntroVideo} from "../video/endgame-intro/IntroVideo.jsx";

export const HomePage: React.FC = () => {
    return (
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', padding: 30, paddingTop: 0}}>
            <h2>Welcome to the new decentralized internet!</h2>
            <Svg src={triangleImg}/>
            <h3>
                Endgame products make developing P2P internet applications faster, easier and cheaper.
            </h3>
            <h2>Video introduction to the Distributed Trustless Graph</h2>
            <IntroVideo/>
            <h1>Endgame product stack</h1>
            <EndgamePyramid/>
            <List style={{width: 'calc(100% - 40px)'}} dataSource={listData} renderItem={(item) =>
                <List.Item>
                    <List.Item.Meta title={item.title} description={
                        <div style={{paddingLeft: 30}}>{item.description}</div>
                    }/>
                </List.Item>
            }>
            </List>
        </div>
    )
}

const listData = [{
    title: 'Reactive Graph',
    description: 'Supporting everything else is the Reactive Graph (RG). RG is a graph data structure with reactivity.\n' +
        '        This means that your code gets notified automatically whenever data that you care about changes.\n' +
        '        That means that Reactive Graph works great as a state store for reactive UI frameworks such as\n' +
        '        React.',
}, {
    title: 'Reactive UI',
    description: 'This layer is a group of adapters for various reactive UI frameworks. Currently, there is one built in for React.'
}, {
    title: 'Authentication',
    description: '        The authentication layer uses a combination of public/private key encryption along with a symetric\n' +
        '        key to allow\n' +
        '        secure authentication and identification on a public network.\n'
}, {
    title: 'DTG',
    description: '        The Distributed Trustless Graph layer provides communication between nodes to update, query and\n' +
        '        register for updates\n' +
        '        in the shared graph.\n'
}, {
    key: 'payments',
    title: 'Payments',
    description: 'The payments layer allows for payments for products, data storage or services'
}];