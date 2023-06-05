import React, {useState} from "react";
import {useDialer} from "@end-game/react-graph";
import {tap} from "rxjs";

const ConnectBtn: React.FC<{n: number}> = ({n}) => {
    const dial = useDialer();
    const [dialState, setDialState] = useState(false);

    const dialPeer = () => dial({url: `ws://localhost:1111${n}`, redialInterval: 1}).pipe(
        tap(() => setDialState(true))
    ).subscribe();

    return (
        <button style={{fontWeight: dialState ? 'bold' : 'normal'}} onClick={dialPeer}>Peer {n} {dialState ? '*': ' '}</button>
    )
};

export const ConnectBtns: React.FC = () => (
    <div>
        <ConnectBtn n={0}/>
        <ConnectBtn n={1}/>
    </div>
)

