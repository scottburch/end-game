import * as React from "react";
import {of, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {ReactGraph} from "../react-graph.jsx";
import type {Graph} from "@end-game/graph";


export const renderApp = (Body: React.FC, graph?: Graph) => {
    const MyApp: React.FC = () => {
        return (
            <>
            <React.StrictMode>
            <ReactGraph graph={graph}>
                <Body/>
            </ReactGraph>
            </React.StrictMode>
            </>
        )
    };

    of(createRoot(document.querySelector('#app') as Element)).pipe(
        tap(root => root.render(<MyApp/>))
    ).subscribe();
};



