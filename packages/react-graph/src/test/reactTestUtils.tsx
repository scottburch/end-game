import * as React from "react";
import {of, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {ReactGraph, useAuth} from "../react-graph.jsx";
import type {GraphId} from "@end-game/graph";
import type {PeerId} from "@end-game/p2p";

export const Username: React.FC = () => {
    const auth = useAuth();
    return <div id="username">{auth.username}</div>;
};

export const renderApp = (graphId: GraphId, peerId: PeerId, Body: React.FC) => {
    const MyApp: React.FC = () => {
        return (
            <>
            <React.StrictMode>
            <ReactGraph graphId={graphId} peerId={peerId}>
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



