import React, {CSSProperties} from 'react'
import {EndgamePyramid} from "../components/EndgamePyramid.jsx";
import triangleImg from '../images/eg-triangle.svg'
import {Svg} from "../components/Svg.jsx";

export const HomePage: React.FC = () => {
    return (
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <h2>Welcome to the new decentralized internet!</h2>
            <Svg src={triangleImg}/>
            <h3>
                Endgame products make developing P2P internet applications faster, easier and cheaper.
            </h3>
            <h1>Endgame product stack</h1>
            <EndgamePyramid/>
            <dl style={styles.descList}>
                <dt style={styles.descTitle}>Reactive Graph</dt>
                <dd style={styles.descBody}>
                    Supporting everything else is the Reactive Graph (RG). RG is a graph data structure with reactivity.
                    This means that your code gets notified automatically whenever data that you care about changes.
                    That means that Reactive Graph works great as a state store for reactive UI frameworks such as React.
                </dd>

                <dt style={styles.descTitle}>Reactive UI</dt>
                <dd style={styles.descBody}>
                    This layer is a group of adapters for various reactive UI frameworks.  Currently, there is one built in for React.
                </dd>

                <dt style={styles.descTitle}>Authentication</dt>
                <dd style={styles.descBody}>
                    The authentication layer uses a combination of public/private key encryption along with a symetric key to allow
                    secure authentication and identification on a public network.
                </dd>

                <dt style={styles.descTitle}>DTG</dt>
                <dd style={styles.descBody}>
                    The Distributed Trustless Graph layer provides communication between nodes to update, query and register for updates
                    in the shared graph.
                </dd>

                <dt style={styles.descTitle}>Payments</dt>
                <dd style={styles.descBody}>
                    The payments layer allows for payments for products, data storage or services
                </dd>


            </dl>
        </div>
    )
}

const styles: Record<'descList' | 'descTitle' | 'descBody', CSSProperties> = {
    descList: {
        width: '80%'
    },
    descTitle: {
        fontWeight: 'bold'
    },
    descBody: {
        marginBottom: 20
    }
}