import React from 'react';
import ReactDOM from 'react-dom/client';
import {Main} from './Main.jsx';
import {ReactGraph} from "@end-game/react-graph";
import {GraphExplorerBtn} from "@end-game/graph-explorer";
import {BrowserRouter} from "react-router-dom";


setTimeout(() => renderIt());

const renderIt = () => {
    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
        <ReactGraph graphId="testnet" persistent={!window.location.href.includes('localhost')}>
            <React.StrictMode>
                <BrowserRouter>
                    <GraphExplorerBtn/>
                    <Main/>
                </BrowserRouter>
            </React.StrictMode>
        </ReactGraph>
    );
}

