import React from 'react';
import ReactDOM from 'react-dom/client';
import {Main} from './Main';
import {dialPeerConnection, startPistolReact} from "@scottburch/pistol";
import '@scottburch/pistol/lib/test/e2e/browser/browser-functions'
import {switchMap, tap} from "rxjs";

startPistolReact().pipe(
    tap(() => setTimeout(() => renderIt())),
//    switchMap(() => dialPeerConnection('ws://localhost:11110', {}))
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

