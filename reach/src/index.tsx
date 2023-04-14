import React from 'react';
import ReactDOM from 'react-dom/client';
import {Main} from './Main.js';
import {dialPeerConnection, newFileStore, newMemoryStore, startPistolReact} from "@scottburch/pistol";
import '@scottburch/pistol/lib/test/e2e/browser/browser-functions'
import {filter, map, tap} from "rxjs";


const isNotLocalhost = () => !/localhost/.test(window.location.hostname)

startPistolReact({store: isNotLocalhost() ? newFileStore('reachv3')  : newMemoryStore()}).pipe(
    tap(() => setTimeout(() => renderIt())),
    filter(() => isNotLocalhost()),
    map(() => `wss://testnet0.pistoldds.net`),
    tap(url => dialPeerConnection(url, {}).subscribe())
).subscribe();

if ((module as any).hot) {
    (module as any).hot.accept()
}

const renderIt = () => {
    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
        <React.StrictMode>
            <Main/>
        </React.StrictMode>
    );
}

