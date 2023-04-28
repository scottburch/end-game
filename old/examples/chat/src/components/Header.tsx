import * as React from "react";
import {usePistolAuth} from "@scottburch/pistol";
import {LinkTo} from "./LinkTo";
import {DisplayName} from "./DisplayName";
import {TagSelector} from "./TagSelector";
import {ConnectPeerBtn} from "./ConnectPeerBtn";

export const Header: React.FC = () => {
    const auth = usePistolAuth();

    return <div style={{background: 'black', color: 'white', padding: 5, display: 'flex'}}>
        <div style={{display: "flex", flexDirection: "column", flex: 1}}>
            <LinkTo to="/" style={{textDecoration: 'none', flex: 1}}><h2>Pistol Demo</h2></LinkTo>
            <div>
                <ConnectPeerBtn peerNo={0}/>
                <ConnectPeerBtn peerNo={1}/>
            </div>
        </div>
        {auth.username ? (
            <div style={{display: "flex", flexDirection: "column"}}>
                <div style={{flex: 1}}>
                <span>
                    Welcome <LinkTo to="/my-profile"><DisplayName pubKey={auth.pubKey || ''}
                                                                  defaultName={auth.username}/></LinkTo>
                </span>
                    <span style={{paddingLeft: 10}}>
                    | <a style={{color: '#ddd'}} href="/">logout</a>
                </span>
                </div>
                <div>
                    <TagSelector/>
                </div>
            </div>
        ) : null}
    </div>
};
