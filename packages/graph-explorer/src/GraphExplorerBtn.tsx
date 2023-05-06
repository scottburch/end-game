import * as React from 'react'
import {createPortal} from "react-dom";
import type {PropsWithChildren} from "react";
import {useState} from "react";
import {Main} from "./Main.jsx";
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
                    <Main/>
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
            `width=${window.innerWidth - 100},height=${window.innerHeight - 100},left=100,top=100`
    );
    (newWindow as any).graph = graph;
    return createPortal(children, newWindow?.document.body as Element);
};