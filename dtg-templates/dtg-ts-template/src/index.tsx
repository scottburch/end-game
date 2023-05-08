import React from 'react';
import ReactDOM from 'react-dom/client';
import {Main} from './Main.jsx';
import {ReactGraph} from "@end-game/react-graph";
import {GraphExplorerBtn} from "@end-game/graph-explorer";


setTimeout(() => renderIt());

const renderIt = () => {
    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
        <React.StrictMode>
            <GraphExplorerBtn/>
            <ReactGraph>
                <Main/>
            </ReactGraph>
        </React.StrictMode>
    );
}

