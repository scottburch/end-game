import {useState} from "react";
import {dialPeerConnection} from "@scottburch/pistol";
import {tap} from "rxjs";

export const ConnectPeerBtn: React.FC<{peerNo: number}> = ({peerNo}) => {
    const [status, setStatus] = useState(`Peer ${peerNo}`);

    const shouldDisable = !status.startsWith('Peer ');

    const dialPeer = () => {
        setStatus(`Dialing peer ${peerNo}...`)
        dialPeerConnection(`ws://${window.location.hostname}:1111${peerNo}`, {}).pipe(
            tap(() => setStatus(`Connected peer ${peerNo}`))
        ).subscribe();
    }


    return (
        <button style={{color: shouldDisable ? 'white' : 'black'}} key={status} onClick={dialPeer} disabled={shouldDisable}>{status}</button>
    )
}