import * as React from "react";
import {of, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {ReactGraph, useAuth} from "@end-game/react-graph";
import type {GraphId} from "@end-game/graph";

export const Username: React.FC = () => {
    const auth = useAuth();
    return <div id="username">{auth.username}</div>;
};


export const renderApp = (graphId: GraphId, Body: React.FC) => {
    const MyApp: React.FC = () => {
        return (
            <ReactGraph graphId={graphId}>
                <Body/>
            </ReactGraph>
        )
    };

    of(createRoot(document.querySelector('#app') as Element)).pipe(
        tap(root => root.render(<MyApp/>))
    ).subscribe();
}


