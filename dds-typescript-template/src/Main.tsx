import React, {CSSProperties} from 'react';
import {Counter} from "./components/Counter";
import {usePistolAuth} from "@scottburch/pistol";
import {Login} from "./components/Login";
import {Welcome} from "./components/Welcome";
import {ConnectPeerBtn} from "./components/ConnectPeerBtn";
import {CountBtn} from "./components/CountBtn";


export const Main: React.FC = () => {
    const auth = usePistolAuth();

    return (
        <div style={styles.main}>
            <h1 style={styles.header}>DDS EXAMPLE</h1>
            <p>This template will get you started with DDS.</p>
            <p>To start the development server type 'yarn start'</p>
            <p>To run tests type 'yarn test' </p>
            <p>To start the local testnet type 'yarn testnet'</p>
            <p>You can use the buttons below to connect to either of the two testnet nodes</p>
            <ConnectPeerBtn peerNo={0}/>
            <ConnectPeerBtn peerNo={1}/>
            <h4>
                <Counter/>
            </h4>
            {auth.pubKey ? <CountBtn/> : null}
            {auth.pubKey ? <Welcome/> : <Login/>}
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#eee',
        height: '100%',
        padding: 30,
        textAlign: 'center'
    },
    header: {
        color: '#100e54'
    }
}


