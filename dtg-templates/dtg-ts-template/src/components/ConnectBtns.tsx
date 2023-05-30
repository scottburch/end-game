import React from "react";
import {useDialer} from "@end-game/react-graph";

export const ConnectBtns: React.FC = () => {
    const dial = useDialer();

    return (
        <div>
            <button>Peer 0</button>
            <button>Peer 1</button>
        </div>
    )
}