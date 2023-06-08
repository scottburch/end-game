import React, {useState} from "react";
import {useDialer} from "@end-game/react-graph";
import {Subscription} from "rxjs";
import {newUid} from "@end-game/graph";
import {Button, Space} from "antd";

const ConnectBtn: React.FC<{n: number}> = ({n}) => {
    const dial = useDialer(newUid());
    const [dialSub, setDialSub] = useState<Subscription>();

    const toggleDial = () => {
        if(!!dialSub) {
            dialSub.unsubscribe();
            setDialSub(undefined);
        } else {
            setDialSub(dial({url: `ws://localhost:1111${n}`, redialInterval: 1}).subscribe())
        }
    }

    return (
        <Button onClick={toggleDial}>Peer {n} {!!dialSub ? '*': ' '}</Button>
    )
};

export const ConnectBtns: React.FC = () => (
    <Space>
        <ConnectBtn n={0}/>
        <ConnectBtn n={1}/>
    </Space>
)

