import * as React from "react";
import {of, tap} from "rxjs";
import {createRoot} from "react-dom/client";
import {ReactGraph, useAuth} from "@end-game/react-graph";
import type {Graph} from "@end-game/graph";

export const Username: React.FC = () => {
    const auth = useAuth();
    return <div id="username">{auth.username}</div>;
};


export const renderApp = (Body: React.FC, graph?: Graph) => {
    const MyApp: React.FC = () => {
        return (
            <ReactGraph graph={graph}>
                <Body/>
            </ReactGraph>
        )
    };

    of(createRoot(document.querySelector('#app') as Element)).pipe(
        tap(root => root.render(<MyApp/>))
    ).subscribe();
}


