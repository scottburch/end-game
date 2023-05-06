import * as React from 'react'
import {createPortal} from "react-dom";
import type {PropsWithChildren, ReactNode} from "react";
import {useState} from "react";
import {GraphExplorer} from "./GraphExplorer.jsx";
import {useGraph} from '@end-game/react-graph'
import type {Graph} from "@end-game/graph";

export const GraphExplorerBtn: React.FC = () => {
    const [open, setOpen] = useState(false);
    const graph = useGraph();

    return (
        <>
        <button onClick={() => setOpen(!open)}>Graph Explorer</button>
            {open ? (
                <NewWindow graph={graph}>
                    <GraphExplorer/>
                </NewWindow>
            ) : null}
        </>
    )
}

const NewWindow: React.FC<PropsWithChildren & {graph: Graph}> = ({children, graph}) => {
    const newWindow =
        window.open(
            "about:blank",
            "newWin",
            `width=400,height=300,left=${window.screen.availWidth / 2 -
            200},top=${window.screen.availHeight / 2 - 150}`
    );
    (newWindow as any).graph = graph;
    return createPortal(children, newWindow?.document.body as Element);
};